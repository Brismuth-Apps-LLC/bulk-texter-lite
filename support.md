# Google Voice Bulk Texter Support

### Tips
* To stop the bulk texter at any time, simply refresh the Google Voice tab.
* Currently the extension [doesn't support sending emojis](https://github.com/brismuth/google-voice-bulk-texter/issues/61).
* If you are unable to send a message manually (without the extension), then that is an issue with your Google Voice account or the number you're sending to, and is not an issue that the extension can help with.
* If you are using https://voice.google.com for texting, make sure you haven't enabled texting via Hangouts, as that will disable sending messages via the Google Voice app.

#### Extension is looping on a single number and failing with an error message
This is usually caused by Google Voice rolling out website changes in phases. Check if there are any [open issues](https://github.com/brismuth/google-voice-bulk-texter/issues) reporting the issue already, and if there are, feel free to subscribe to them or comment on them. If there are no issues already reported, open a new one by following the instructions [below](https://github.com/brismuth/google-voice-bulk-texter/blob/master/support.md#support).

_Note: As of August 17th, Google is rolling out breaking changes: see [#87](https://github.com/brismuth/google-voice-bulk-texter/issues/87)._

#### Account suspension / Error: "confirmSent" failed
If the extension was working for you for one or more messages but stopped suddenly, it is likely that Google has flagged your messages as potential spam, which is against Google's terms of service. Continuing to send messages that appear to be spam could result in your account being deactivated. 
* See the Google Voice [Acceptable Use Policy](https://support.google.com/voice/answer/9230450?hl=en&ref_topic=9273222)
* See these two Google Voice forum threads:
  1. https://support.google.com/voice/forum/AAAAjq5-_rMCpSfMRYCUpc
  2. https://support.google.com/voice/forum/AAAAjq5-_rMM-d-H28-17k
* Google does not publish their algorithm for spam detection. Because of that, I cannot make any guarantees on what will or will not make your messages look like spam.
* If your messages are not spam but Google thinks they are, it could be because your messages are too long or because they contain a link. Some users have reported that shortening their message or removing links has resolved the issue for them.
* As mentioned in the above forum threads, this issue will usually clear up after some time passes, although you may need to change the content of the message you're sending as well.
* A process for repealing an account ban can be found here: https://github.com/brismuth/google-voice-bulk-texter/issues/65

#### Sending via Hangouts isn't working
* Make sure the Hangouts interface is on the page and finished loading
* Make sure Google Voice via Hangouts is enabled ([instructions](https://support.google.com/voice/answer/6023920?co=GENIE.Platform%3DDesktop&hl=en))

### Support
If you are experiencing issues with Google Voice Bulk Texter and the above tips didn't help you out, please file an issue here:
https://github.com/brismuth/google-voice-bulk-texter/issues/new/choose

You can see currently open issues here:
https://github.com/brismuth/google-voice-bulk-texter/issues

### Donating 
If you'd like to donate to show your appreciation for this extension, you can do so on PayPal (https://paypal.me/brismuth) or Venmo (@brismuth).

You can also leave a review in the Chrome Web store:
https://chrome.google.com/webstore/detail/google-voice-bulk-texter/gdplkhplnfgmodalfimcondhmokmekka

Thanks!
