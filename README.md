# Bulk Texter Lite / Google Voice Bulk Texter
A browser extension that can send personalized bulk SMS text messages via [Google Voice](https://voice.google.com).

It is available as an [Edge add-on](https://microsoftedge.microsoft.com/addons/detail/google-voice-bulk-texter/olokpmeifgmfmhdnpfllllfnakdakldl), a [Firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/bulk-texter/) or you can follow the [instructions below](#install-it) to install it manually in Chrome.

This is the same software that was previously called "Google Voice Bulk Texter". It has been renamed to avoid confusion - this software is not affiliated with Google or Google Voice. 

## What is it?
This is a chrome extension that allows you to write a message once and send it to a list of numbers and names (names are optional). It is a huge time saver if you need to send the same message to a lot of people and you already have a list of phone numbers and names. It is useful for things like planning events, sending announcements to your church group, or sending reminders to your clients. 

#### Google Voice Demo
![](https://raw.githubusercontent.com/brismuth/google-voice-bulk-texter/main/demo/demo-google-voice.jpg)

## Want more features? Check out [Bulk Texter Pro](https://www.bulktexterpro.com)!

Here are the differences between Bulk Texter Lite and Bulk Texter Pro, as well as all the items that are currently on our roadmap!

|  | Bulk Texter Pro | Bulk Texter Lite |
| --- | --- | --- |
| Cost | $4.95 / month | Free forever |
| Support | Personal support via [email](mailto:support@bulktexterpro.com) | Community support on [Github](https://github.com/Brismuth-Apps-LLC/bulk-texter-lite/blob/main/support.md) |
| Bulk send text messages | ✅ | ✅ |
| Customize each message with recipient name | ✅ | ✅ |
| Unlimited messages <br/> *(limited only by Google, not by us)* | ✅ | ✅ |
| Schedule messages in advance | ✅ | ❌ |
| Previewing generated messages pre-send | ✅ | ❌ |
| [CSV upload](https://www.bulktexterpro.com/docs/getting-started/using-csv-upload) with unlimited columns/variables | ✅ | ❌ |
| Send group texts | ✅ | ❌ |
| View / download previously sent messages | ✅ | ❌ |
| Dark Mode :) | ✅ | ❌ |
| Sending images | On the roadmap! | ❌ |
| Send via [Google Messages](https://messages.google.com/web/) / Android phones | On the roadmap! | ❌ |
| Send via iMessage (for MacOS) | On the roadmap! | ❌ |
| Send via [TextNow.com](https://www.textnow.com/) | On the roadmap! | ❌ |
| MacOS integration with iMessage | On the roadmap! | ❌ |
| Support for Spin Syntax / Spintax | On the roadmap! | ❌ |
| Save and use quick replies / snippets within Google Voice | On the roadmap! | ❌ |
| Integrate with Google Contacts | On the roadmap! | ❌ |
| Save favorite message templates and contact lists | On the roadmap! | ❌ |
| Full export/import for all app data | On the roadmap! | ❌ |


## Installing Bulk Texter Lite
You can easily install this extension by following the instructions for your browser:

### Firefox (recommended)
1. Install [Firefox](https://www.mozilla.org/en-US/firefox/new/), if you haven't already.
2. In Firefox, visit the official [Firefox store listing](https://addons.mozilla.org/en-US/firefox/addon/bulk-texter/) and click "Add to Firefox". 

This is a recommended way to install Bulk Texter Lite, because it will keep your software up to data automatically, helping you avoid issues with old versions of the software.

### Microsoft Edge (recommended)
In Microsoft Edge, visit the official [Edge store listing](https://microsoftedge.microsoft.com/addons/detail/google-voice-bulk-texter/olokpmeifgmfmhdnpfllllfnakdakldl) and click "Get". 

This is a recommended way to install Bulk Texter Lite, because it will keep your software up to data automatically, helping you avoid issues with old versions of the software.

### Chrome (manual installation from source code)
This method is not recommended, as it will not automatically stay up to date, and is more complicated.

1. Download the zip: https://github.com/Brismuth-Apps-LLC/bulk-texter-lite/archive/main.zip
2. Extract the zip file on your computer
3. Open chrome://extensions in Chrome
4. Turn on "Developer mode" at the top right
5. Click on "Load Unpacked"
6. Navigate to the extracted project folder from step #2 and select the folder `src`. If you get a "missing manifest" error, make sure you selected the `src` folder, rather than the folder that contains it.
7. That's it! It should be installed locally now.


## Update it
Firefox and Edge will automatically keep your add-on up to date, but it can take 24-48 hours for the update to arrive on your computer.

If you previously installed the extension manually in Chrome and would like to switch to FireFox or Edge (recommended), you would just need to remove the extension on the chrome://extensions page and follow the instructions above for FireFox/Edge.

You can follow these instructions to update Bulk Texter Lite if you installed it manually, and want to keep a manual installation (not recommended):
1. Download the zip: https://github.com/Brismuth-Apps-LLC/bulk-texter-lite/archive/main.zip
2. Extract the zip file on your computer
3. Delete the contents of your previously installed Bulk Texter Lite / Google Voice Bulk Texter folder (but not the folder itself)
4. Move the contents of your newly extracted folder from step #2 into the existing installation folder from step #3
5. Open chrome://extensions in Chrome
6. Turn on "Developer mode" with the toggle at the top right, if it is not already enabled
7. Click the "refresh" icon at the bottom right of the Bulk Texter Lite / Google Voice Bulk Texter card
8. That's it! It should now be fully up to date.

## Permissions
* Change data on voice.google.com
  * This is for sending messages.
* Clipboard access
  * This is necessary in order to automate the message preparation and sending.
* Storage
  * This is for persisting extension data across all Chrome browsers that you sign into 

## Get support or report an issue
https://github.com/Brismuth-Apps-LLC/bulk-texter-lite/blob/main/support.md
