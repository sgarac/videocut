$(document).ready(function () {
	var audio = {
		close: function() {
			var a = document.getElementById('linkeditor_container'),
			b = document.getElementById('linkeditor_overlay');
			if (a) a.remove();
			if (b) b.remove();
		},
		init: function () {
			var array = ['video', 'audio/mpeg','audio/wav','audio/wav','audio/flac'];
           		array.forEach(mine => {
				OCA.Files.fileActions.registerAction({
				name: 'videocutter',
				displayName: 'Cut Audio/Video',
				mime: mine,
				permissions: OC.PERMISSION_UPDATE,
				type: OCA.Files.FileActions.TYPE_DROPDOWN,
				iconClass: 'icon-external',
				actionHandler: function (filename, context) {
				var a = context.$file[0].children[1].children[0].children[0].innerHTML;
				var b = 'background-repeat:no-repeat;margin-right:1px;display: block;width: 40px;height: 32px;white-space: nowrap;border-image-repeat: stretch;border-image-slice: initial;background-size: 32px;';
				var position = 30;
				var output = [a.slice(0, position), b, a.slice(position)].join('');
				var type='';
				$.ajax({
					type: "GET",
					async: "true",
					url: OC.filePath('videocut', 'ajax', 'getSize.php'),
					data: {nameOfFile: filename, directory: context.dir, external: context.fileInfoModel.attributes.mountType == "external"?1:0},
					success: function (element) {
						response = JSON.parse(element);
						type = response.type;
						if (response.code == 1) {
							t = response.timeline.split(':');
							/*document.getElementById("endHours").value = t[0];
							document.getElementById("endMins").value = t[1];
							document.getElementById("endSecs").value = t[2];*/
							html='';
							url = "https://"+window.location.hostname+"/remote.php/dav/files/"+oc_current_user+context.dir+'/'+filename;
							if (type === "audio") {
								html='<audio id="media" controls="controls" src="" width="100%">Votre navigateur ne supporte pas la balise audio</audio>';
							}
							else if (type === "video") {
								html='<video id="media" controls="controls" src="" width="100%">Votre navigateur ne supporte pas la balise video</video>';
							}
							document.getElementById('player').innerHTML=html;
							document.getElementById('media').src=url;
							loadDuration=function(){
								d=document.getElementById('media').duration;
								a=[];
								b=Math.floor(d/3600);
								b=b<10?'0'+b:b;
								a.push(b);
								d=d%3600;
								b=Math.floor(d/60);
								b=b<10?'0'+b:b;
								a.push(b);
								d=d%60;
								b=Math.floor(d);
								b=b<10?'0'+b:b;
								a.push(b);
								b=Math.floor((d-Math.floor(d))*1000);
								b=b>100?b:b>10?'0'+b:'00'+b;
								a.push(b);
								document.getElementById('endHours').value = a[0];
								document.getElementById('endMins').value = a[1];
								document.getElementById('endSecs').value =a[2]+'.'+a[3];
							};
							setTimeout(loadDuration,1000);
						} else {
							context.fileList.showFileBusyState(tr, false);
							//OC.dialogs.alert( t('videocutter', response.desc), t('videocutter', 'Error converting ' + filename) );
						}
					}
				});
				var linkEditor = '<div class="urledit push-bottom">'
					+ '<a class="oc-dialog-close" id="btnClose"></a>'
					+ '<h2 class="oc-dialog-title" style="display:flex;margin-right:30px;">'
					+ output
					+ filename
					+ '</h2>'
					+ '<div class="sk-circle" style="display:none" id="loading"><div class="sk-circle1 sk-child"></div><div class="sk-circle2 sk-child"></div><div class="sk-circle3 sk-child"></div><div class="sk-circle4 sk-child"></div><div class="sk-circle5 sk-child"></div><div class="sk-circle6 sk-child"></div><div class="sk-circle7 sk-child"></div><div class="sk-circle8 sk-child"></div><div class="sk-circle9 sk-child"></div><div class="sk-circle10 sk-child"></div><div class="sk-circle11 sk-child"></div><div class="sk-circle12 sk-child"></div></div>'
					+ '<div style="text-align:center; display:none; margin-top: 10px;" id="noteLoading">'
					+ '<p>Note: This could take a considerable amount of time depending on your hardware and the preset you chose. You can safely close this window.</p>'
					+ '</div>'
					+ '<div id="player"></div>'
					+ '<div id="params">'
					+ '<br>'
					+ 'Start :'
					+' <br/> <input type="text" id="startHours" value="00" />h <input type="text" id="startMins" value="00" /> mins <input type="text" id="startSecs" value="00" />s<br/>'
					+ 'End :'
					+ '<br/> <input type="text" id="endHours" value="00" />h <input type="text" id="endMins" value="00" /> mins <input type="text" id="endSecs" value="00"/>s'
					+ '</div>'
					+ '<p class="vc-label urldisplay" id="text" style="display: inline; margin-right: 10px;">'
					//+ t('videocut', 'Action')
					+ '</p>'
					+ '<div class="oc-dialog-buttonrow boutons" id="buttons">'
					+ '<a class="button primary" id="send">Cut</a></div>';
				$('body').append(
					'<div id="linkeditor_overlay" class="oc-dialog-dim"></div>'
					+ '<div id="linkeditor_container" class="oc-dialog fullscreen" style="position: fixed;">'
					+ '<div id="linkeditor">' + linkEditor + '</div>'
				);
				var finished = false;
				document.getElementById("btnClose").addEventListener("click", function () {
					audio.close();
					finished = true;
				});

				document.getElementById("linkeditor_overlay").addEventListener("click", function () {
					audio.close();
					finished = true;
				});
		                    document.getElementById('send').addEventListener("click", function ($element) {
					var sh = (+document.getElementById("startHours").value)*3600;
					var sm =  (+document.getElementById("startMins").value)*60;
        		                var ss = document.getElementById("startSecs").value;
					var start = (sh) + (+sm) + (+ss);
					var eh=(+document.getElementById("endHours").value*3600);
					var em=(+document.getElementById("endMins").value)*60;
					var es =  (document.getElementById("endSecs").value);
					var end = (eh) + (+em) + (+es);
					if (isNaN(start) || isNaN(end))  {
						alert("Wrong time entered for start or end");
						return ;
					}
					if (start>=end) {
						alert("Nothing to do, end has to be after start");
						return ;
					}
					end-=start;
					var startStr = document.getElementById("startHours").value+':'+document.getElementById("startMins").value+":"+document.getElementById("startSecs").value;
					var endStr = Math.floor(end/3600)+':';
					end%=3600;
					endStr+=Math.floor(end/60) + ':' + end%60;
					var data={};
					if (context.fileInfoModel.attributes.mountType == "external") {
						data = {
							nameOfFile: filename,
							directory: context.dir,
							external: 1,
							start: startStr,
							end: endStr,
							mtime: context.fileInfoModel.attributes.mtime,
						};
					} else {
						data = {
							nameOfFile: filename,
							directory: context.dir,
							external: 0,
							start: startStr,
							end: endStr,
							shareOwner: context.fileList.dirInfo.shareOwnerId,
						};
					}
					var tr = context.fileList.findFileEl(filename);
					context.fileList.showFileBusyState(tr, true);
					$.ajax({
						type: "POST",
						async: "true",
						url: OC.filePath('videocut', 'ajax', 'convertHere.php'),
						data: data,
						beforeSend: function () {
							document.getElementById("loading").style.display = "block";
							document.getElementById("noteLoading").style.display = "block";
							document.getElementById("params").style.display = "none";
							document.getElementById("text").style.display = "none";
							var p = document.getElementById("player");
							p.parentNode.removeChild(p);
							document.getElementById("buttons").setAttribute('style', 'display: none !important');
						},
						success: function (element) {
							element = element.replace(/null/g, '');
							response = JSON.parse(element);
							if (response.code == 1) {
								this.filesClient = OC.Files.getClient();
								audio.close();
								window.location.reload();
							} else {
								context.fileList.showFileBusyState(tr, false);
								audio.close();
								//OC.dialogs.alert( t('videocutter', response.desc), t('videocutter', 'Error converting ' + filename) );
								}
							}
						});
					});
				}
			});
			});
		}
	};
	audio.init();
});
