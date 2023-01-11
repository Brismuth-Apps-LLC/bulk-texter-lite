# Bulk Texter Lite - Support

### Tips
* To stop Bulk Texter Lite at any time, simply refresh the Google Voice tab.
* If you are unable to send a message manually (without Bulk Texter Lite), then that is an issue with your Google Voice account or the number you're sending to, and is not an issue that Bulk Texter Lite can help with. If Bulk Texter Lite isn't working, try sending a message manually and see if that works.
* Before proceeding with this guide, make sure that you are running the latest version of Bulk Texter Lite by following the [update guide](https://github.com/Brismuth-Apps-LLC/bulk-texter-lite/blob/main/README.md#update-it).
* If you are using https://voice.google.com for texting, make sure you haven't enabled texting via Hangouts, as that will disable sending messages via the Google Voice app.
* Although text messages can be in any language, Bulk Texter Lite requires that the Google Voice interface be in English - make sure that both your Google Account and your browser settings are set to English for the Google Voice page.

#### Some messages aren't sending, but others are. I'm not getting any error messages.
If Bulk Texter Lite worked for you for one or more messages but not for others, it is likely that Google is rate limiting you. 

We can not comment on Google Voice's limits, as they are not published, and Bulk Texter Lite is not affiliated with Google/Google Voice.

Here are some tips that may help you avoid being rate limited or blocked by Google:
* This one may seem obvious, but don't send spam. If you're looking for a solution for prospecting or marketing, Google Voice and Bulk Texter Lite probably aren't the right choice.
* Avoid sending more than ~50 messages per hour.
* Ensure that each message is unique (i.e. use the name field) and conversational. [Bulk Texter Pro](https://www.bulktexterpro.com/) supports [CSV Upload](https://www.bulktexterpro.com/docs/getting-started/using-csv-upload/), which can make your messages even more customized.
* Some users have reported that when recipients are responsive and text back, they are less likely to * experience message blocks from Google.
* Some users have reported that removing URLs/website links has helped them - but it often does not cause any problem.
* Try increasing the time between messages, if you're using a shorter delay.
* Longer messages may be more likely to be blocked as well.
* If you feel your account has been blocked in error, you can fill out Google's support form here: https://support.google.com/accounts/contact/suspended

#### Error: "startChat" failed
See issue [#149](https://github.com/brismuth/google-voice-bulk-texter/issues/149) - this can be caused by incorrectly formatted phone numbers. Double check the phone number that it's failing on.

#### Bulk Texter Lite is looping on a single number and failing with an error message.
This is usually caused by Google Voice rolling out website changes in phases. 

First, make sure that you are running the latest version of Bulk Texter Lite by following the [update guide](https://github.com/Brismuth-Apps-LLC/bulk-texter-lite/blob/main/README.md#update-it).

If it's still not working on the latest version, Check if there are any [open issues](https://github.com/Brismuth-Apps-LLC/bulk-texter-lite/issues) reporting the issue already, and if there are, feel free to subscribe to them or comment on them. 

If there are no issues already reported, open a new one by following the instructions [below](https://github.com/Brismuth-Apps-LLC/bulk-texter-lite/blob/main/support.md#support).

### Support
If you are experiencing issues with Bulk Texter Lite and the above tips didn't help you out, please file an issue here:
https://github.com/Brismuth-Apps-LLC/bulk-texter-lite/issues/new/choose

You can see currently open issues here:
https://github.com/Brismuth-Apps-LLC/bulk-texter-lite/issues
