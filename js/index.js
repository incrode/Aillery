import {Settings} from './Settings.js';
import {Storage} from './APIs/Storage.js';
import {OptionBox} from '../UI/js/OptionBox.js';
import {Loader} from '../UI/js/Loader.js';

const folderView=document.querySelector("[data-view-folders]");
const plus=document.querySelector("[data-plus]");
const theme=document.querySelector("[data-toggle-theme]"); 


function setFolderHandler(folder)
{
	OptionBox({
		headText:folder.name,
		options: ["Delete","Rename","Open"]
	}).then((opt)=>{
		let option = opt.innerText;
		switch(option){
			case "Delete":
				Storage.folderHandler.Delete(folder.id).then(()=>{
					App.loadFolders();
				}).catch((e)=>{
					console.log(e);
					alert("Failed to delete folder");
				});
				break;
			case "Rename":
				let newName = prompt("New Name:",(new Date()).getTime());
				Storage.folderHandler.Rename(folder.id,newName).then(()=>{
					App.loadFolders();
				}).catch((e)=>{
					console.log(e)
					alert("Failed to rename folder !");
				});
				break;
			case "Open":
				Settings.opened_folder = folder.id;
				Settings.pushPage(location.href);
				let url = location.href;
				url = url.slice(0,url.lastIndexOf("/"));
				location.replace(url+'/folder.html');
				break;
		}
	}).catch(()=>{
		/*** Nothing done ***/
	});
}

function createFolderDiv(name)
{
	const folder=document.createElement("div");
	folder.classList.add("folder");


	const folderIcon=document.createElement("div");
	folderIcon.classList.add("folder-icon");

	const folderName=document.createElement("a");
	folderName.classList.add("folder-name");
	folderName.textContent=name;

	folder.appendChild(folderIcon);
	folder.appendChild(folderName);

	return(folder);
}



const App = {
	folders: [],
	init: function() {

		if ("serviceWorker" in navigator)
		{
			navigator.serviceWorker.register(location.href.slice(0, location.href.lastIndexOf("/")) + "/sw.js",{
				scope: location.href
			}).then(()=>{
				console.log("Loaded service worker successfully!");
			}).catch((error)=>{
				console.log("Failed to load service worker: ", error);
			});
		}

		Loader.init(document.body);
		Storage.init().then(()=>{
			App.loadFolders();
			Loader.remove();
		}).catch(()=>{
			alert("Cannot create or load database !");
		});

		Settings.init();
		Settings.opened_pages = "";
		Settings.opened_folder = "0";
		Settings.opened_image = "0";
		Settings.applyTheme();

		plus.onclick=()=>{
			let o=OptionBox({
				headText:"New",
				options:["Folder","Image"]
			});
			o.then((e)=>{
				if(e.innerText === "Folder")
				{
					App.addFolder();
				}else if(e.innerText === "Image")
				{
					App.addImage();
				}
			}).catch(()=>{
				/*** Nothing done ***/
			});
		}

		theme.onclick = () => {
			Settings.toggleTheme();
			Settings.applyTheme();
		}


	},
	loadFolders: function (){
		Storage.folderHandler.getAllFolders().then((f)=>{
			if(f == null) return;

			App.folders=f;
			App.loadView();
		}).catch((e)=>{
			alert("Problem in loading folders");
			console.log(e)
		});
	},
	loadView: function (){
		folderView.innerHTML="";
		this.folders.forEach((val)=>{
			let fDiv=createFolderDiv(val.name);
			fDiv.onclick = () => {
				setFolderHandler(val);
			}
			folderView.appendChild(fDiv);
		});
	},
	addFolder: async function (){
		const name=prompt("Folder Name:",(new Date()).getTime());
		if(name === null) return;
		await Storage.folderHandler.Folder(name);
		this.loadFolders();
	},
	addImage: function (){
		/* all AI handled by capture.html */
		Settings.pushPage(location.href);
		let url = location.href;
		url = url.slice(0,url.lastIndexOf("/"));
		location.replace(url+"/capture.html");
	}
}


window.onload=App.init.bind(App);
