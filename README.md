# Toggl API interface
This is an interface to the Toggl API for javascript. In particular, for the Scriptable application.

## Usage in Scriptable
To use this interface, is necesary to obtain the token and the Workspace ID for your account. Each user can find their Token https://track.toggl.com/profile while logged in. The workspace ID is in all time entries created and it is only necesary when creating a new proyect and obtaining reports. This information should be in a file named UserInfo.json in the following structure:

```
{
"Token":[Your Token],
"wid":[Your Workspace ID]
}
```

The file should be in the in the same folder as the Toggl.js file and is necessary to bookmark the folder as Toggl in the Scriptable app.

## Usage in other JS enviroments
This is still in developement. It is possible to adapt manualy to different enviroments modifing the request function and the GetUserInfo function.

## Toggl API documentation
https://github.com/toggl/toggl_api_docs