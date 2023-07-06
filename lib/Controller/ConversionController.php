<?php
namespace OCA\videocut\Controller;

use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;
use \OCP\IConfig;
use OCP\EventDispatcher\IEventDispatcher;
use OC\Files\Filesystem;

class ConversionController extends Controller {

	private $userId;

	/**
	* @NoAdminRequired
	*/
	public function __construct($AppName, IRequest $request, $UserId){
		parent::__construct($AppName, $request);
		$this->userId = $UserId;

	}

	public function getFile($directory, $fileName){
		\OC_Util::tearDownFS();
		\OC_Util::setupFS($this->userId);
		return Filesystem::getLocalFile($directory . '/' . $fileName);
	}
	public function  getSize($nameOfFile, $directory, $external) {
		$file = $this->getFile($directory, $nameOfFile);
		$time = shell_exec('/home/sgarac/bin/filesize.sh "'.$file.'"');
		$type = shell_exec('/home/sgarac/bin/fileType.sh "'.$file.'"');
		if (strpos($type,"audio")!==false) {
			$type = "audio";
		}else if (strpos($type,"video")!==false) {
			$type = "video";
		}
		return json_encode( array( "code" => 1, "timeline" => trim($time), "type" => $type) );
	}
	/**
	* @NoAdminRequired
	*/
	public function convertHere($nameOfFile, $directory, $external, $start, $end, $shareOwner = null, $mtime = 0) {
		$file = $this->getFile($directory, $nameOfFile);
		$dir = dirname($file);
		$array = array();
		$code = 0;
		$secondCode = 0;
		if (file_exists($file)){
			$cmd = $this->createCmd($file, $start, $end);
			$output = "";
			exec($cmd, $output,$code);
			$ss = "php /var/www/nextcloud/occ files:scan ".$this->userId;
			exec($ss, $output, $secondCode);
			$array['cmd'] = $cmd;
			$array['secondCode'] = $secondCode;
			$array['secondCmd'] = $ss;
			if($code == 127){
				$array['code'] = 0;
				$array['desc'] = 'ffmpeg not available';
			}else{
				$array['code'] = 1;
			}
		}
		else{
			$array = array_merge($array, array("code" => 0, "desc" => "Can't find file at ". $file));
		}
		return json_encode($array);
	}
	/**
	* @NoAdminRequired
	*/
	public function createCmd($file, $start, $end){
		$fileName = str_replace( "." , "_cut." , $file);
		$i=1;
		while (file_exists($fileName)) {
			if ($i<2) {
				$fileName = str_replace("_cut." , "_cut".$i."." , $fileName);
			}
			else {
				$fileName = str_replace("_cut".($i-1)."." , "_cut".$i."." , $fileName);
			}
			$i++;
		}
		return 'ffmpeg -ss '.$start.' -i "'.$file.'" -c copy -t '.$end.' "'.$fileName.'"';
	}
}
