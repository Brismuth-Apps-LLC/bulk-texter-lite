# Google Voice Bulk Texter
A Firefox/Chrome extension that can send personalized bulk SMS messages via [Google Voice](https://voice.google.com) or [Google Hangouts](https://hangouts.google.com/).

It is available as a [Firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/bulk-texter/) or you can follow the [instructions below](#install-it) to install it manually in Chrome.

## What is it? 
This is a chrome extension that allows you to write a message once and send it to a list of numbers and names (names are optional). It is a huge time saver if you need to send the same message to a lot of people and you already have a list of phone numbers and names. It is useful for things like planning events, sending announcements to your church group, or sending reminders to your clients. 


### Site Functionality
| Site  | Bulk message templating  | Automated message sending  |
|---|---|---|
| [voice.google.com](https://voice.google.com)  | Yes  | Yes  |
| [hangouts.google.com](https://hangouts.google.com/)  | Yes  | No _(does not actually send the messages, it just prepares them so you can easily review and send them by pressing "Enter")_  |

#### Google Voice Demo
![](https://raw.githubusercontent.com/brismuth/google-voice-bulk-texter/master/demo/demo-google-voice.jpg)

### Install it
You can easily install this extension by following the instructions for your browser:

#### Chrome (install from source)
1. Download the zip: https://github.com/brismuth/google-voice-bulk-texter/archive/master.zip
2. Extract the zip file on your computer
3. Open chrome://extensions in Chrome
4. Turn on "Developer mode" at the top right
5. Click on "Load Unpacked"
6. Navigate to the extracted project folder from step #2 and select the folder `src`
7. That's it! It should be installed locally now.

#### Firefox
Visit https://addons.mozilla.org/en-US/firefox/addon/bulk-texter/ in your browser and click "+ Add to Firefox"


### Update it
Firefox will automatically keep your add-on up to date, but it can take 24-48 hours for the update to arrive on your computer.

To update the extension in Chrome, follow the above installation instructions again, making sure to choose the correct extracted project folder in step #6.

### Permissions
* Change data on hangouts.com and voice.google.com
  * This is for sending messages.
* Clipboard access
  * This is necessary in order to automate the message preparation and sending.
* Storage
  * This is for persisting extension data across all Chrome browsers that you sign into 

#### Analytics & Tracking  
* Contact information and messages are NOT collected.   
* None of the information collected can be linked to your account or person, and the collected information is only used to improve the application.
* Data collected: Number of messages sent and the extension version number that is in use.

### Get support or report an issue
https://github.com/brismuth/google-voice-bulk-texter/blob/master/support.md

### Donating 
If you'd like to donate to show your appreciation for this extension, you can do so on PayPal (https://paypal.me/brismuth) or Venmo (@brismuth).

Thanks!
