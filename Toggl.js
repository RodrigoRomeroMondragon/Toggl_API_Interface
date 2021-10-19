// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: power-off;

// Made by Rodrigo Romero
onWindows = 1
//onWindows = 0

const UserInfo = GetTogglUserInfo()
const TogglToken = UserInfo.Token + ":api_token" 
let TogglAuth 
if(!onWindows){
  TogglAuth = Data.fromString(TogglToken).toBase64String();
}
else
{
  TogglAuth = Buffer.from(TogglToken).toString('base64')
}
const TogglURL = "api.track.toggl.com";
const ReportURL = "https://api.track.toggl.com/reports/api/v2/"

const  request = async (method,type,id,headers = {},body=null) =>
{
  let response
  let TogglRequest
  let options
  if (id == "") {
      url = TogglURL +"/api/v8/"+ type;
  }    
  else {
      url = "https://" + TogglURL +"/api/v8/"+ type + "/" + id;
  }
  headers["Authorization"] = "Basic "+TogglAuth;

  if(!onWindows){
    TogglRequest = new Request(url);
    TogglRequest.method = method;
    
    TogglRequest.headers = headers;
    if (body != null)
    {
        TogglRequest.body = JSON.stringify(body);
    }

    response = await  TogglRequest.loadJSON();
  }
  else
  {
    options = 
    {
      "hostname": TogglURL,
      "path":"/api/v8/"+ type + "/" + id,
      "method": method,
      "headers": headers
    }
    response = await doRequest(options,body)
  }

  return response;
};

async function report(type,query,headers={})
{
  url = ReportURL + type + "?" + query + "&workspace_id=" + UserInfo.wid + "&wid=" + UserInfo.wid + "&user_agent=scriptable";
  let TogglRequest = new Request(url);
  TogglRequest.method = "GET";
  headers["Authorization"] = "Basic " + TogglAuth;
  TogglRequest.headers = headers;
  
  let  response = await  TogglRequest.loadJSON();
  return response
}
async function GetTask(id)
{
  let response = await request("GET", "time_entries", id);
  return response;
};

async function GetCurrentTask()
{
   return module.exports.GetTask("current");
};

async function StartTask(description, pid = 0,tags = [])
{
  let header ={ "Content-Type": "application/json"};
  let body = {"time_entry":{"description":description,"created_with":"scriptable"}};
  if (pid != 0)
  {
    body.time_entry["pid"] = pid
  }
  if (tags != [])
  {
    body.time_entry["tags"] = tags
  }
  let response = await request("POST", "time_entries", "start", header, body);
  return response;
};

async function StopTask(id)
{
  let response = await request("PUT", "time_entries", id + "/stop");
  
  return response;
}

// POST https://api.track.toggl.com/api/v8/projects
async function CreateProject(name) {
    let header = { "Content-Type": "application/json" };
    let projectSetup = { 'project': { "name": name, "wid" : parseInt(UserInfo.wid) } };
    let response = await request("POST", "projects", "", header, projectSetup);
    return response
}

// GET https://api.track.toggl.com/api/v8/workspaces/{workspace_id}/projects
async function GetProjects()
{
    let response = await request("GET", "workspaces", UserInfo.wid + "/projects")
    return response
}

async function SearchTimeEntries(query)
{
  let Report = await report("details",query)
  return Report
}


module.exports.GetTask = GetTask
module.exports.GetCurrentTask = GetCurrentTask
module.exports.StartTask = StartTask
module.exports.StopTask = StopTask
module.exports.CreateProject = CreateProject
module.exports.GetProjects = GetProjects
module.exports.SearchTimeEntries = SearchTimeEntries

function GetTogglUserInfo() {
    let FM 
    let UserInfo
    if (!onWindows){
     FM = FileManager.local()
     UserInfo = FM.readString(FM.bookmarkedPath("Toggl") + "/UserInfo.json")
   }
   else{
     FM = require('fs')
     UserInfo=FM.readFileSync("Toggl/UserInfo.json",{encoding:'utf8', flag:'r'})
  }
    return JSON.parse(UserInfo)
}

function doRequest(options,data) {
  return new Promise ((resolve, reject) => {
    let http = require('https')
    let response = http.request(options ,res =>{
    let chunks_of_data = [];

      res.on('data', (fragments) => {
            chunks_of_data.push(fragments);
          });
      res.on('response',res => {
           resolve(res);
         });

      res.on('end', () => {
        let response_body = Buffer.concat(chunks_of_data);
        resolve(JSON.parse(response_body.toString()));
      });

      res.on('error', (error) => {
        reject(error);
      });
    });
    if(data != null){
      let aux2 = JSON.stringify(data)
      response.write(JSON.stringify(data))
    }
    response.end()
  }); 
}