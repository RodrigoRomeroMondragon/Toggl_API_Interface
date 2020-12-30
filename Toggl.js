// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: power-off;

// Made by Rodrigo Romero

const UserInfo = GetTogglUserInfo()
const TogglToken = UserInfo.Token + ":api_token" 
const TogglAuth = Data.fromString(TogglToken).toBase64String();
const TogglURL = "https://api.track.toggl.com/api/v8/";
const ReportURL = "https://api.track.toggl.com/reports/api/v2/"

const  request = async (method,type,id,headers = {},body=null) =>
{
    if (id == "") {
        url = TogglURL + type;
    }    
    else {
        url = TogglURL + type + "/" + id;
    }
  let TogglRequest = new Request(url);
  TogglRequest.method = method;
  headers["Authorization"] = "Basic "+TogglAuth;
  TogglRequest.headers = headers;
  if (body != null)
  {
      TogglRequest.body = JSON.stringify(body);
  }

  let  response = await  TogglRequest.loadJSON();
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
    let FM = FileManager.local()
    let UserInfo = FM.readString(FM.bookmarkedPath("Toggl") + "/UserInfo.json")
    return JSON.parse(UserInfo)
}