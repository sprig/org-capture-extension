# Org Capture Extension

This is an extension for Google Chrome (tm) which adds a "Capture" button, sending the site address, title, and selected text (if any) to emacs via org-protocol, see the [Org-Mode site] for instructions for setting that up org-protocol. The extentsion itself is available at the [Chrome App Store].

## Detailed setup instructions

#### Install the extension

Either via the [Chrome App Store] or by dragging the extension folder to the "Extensions" tab in Chrome. If the latter is the chosen procedure then one needs to enable developer mode first, if I'm not mistaken. Note that if you choose to have a local-install, then you need to choose some icon and name it org-mode-unicorn.png, placing it in the extension's folder. Or, you can name it anything you want, but then you need to update manifest.json.

#### Set up org-protocol

Detailed instructions available at [Org-Mode site]. The gist of it is to make emacs load org-protocol and to make your system recognize emacsclient as the handler of org-protocol:// links.

#### Set up handlers in emacs

If some text is selected before the button is clicked, then the following is sent to emacs:
```
org-protocol://capture:/p/<url>/<title>/selection>
```

If nothing is selected, then instead the following is sent:
```
org-protocol://capture:/L/<url>/<title>
```

This means that you need to have appropriate capture templates for "L" and for "p". Example templates below:

```
(setq org-capture-templates `(
	("p" "Protocol" entry (file+headline ,(concat org-directory "notes.org") "Inbox")
        "* %^{Title}\nSource: %u, %c\n #+BEGIN_QUOTE\n%i\n#+END_QUOTE\n\n\n%?")
	("L" "Protocol Link" entry (file+headline ,(concat org-directory "notes.org") "Inbox")
        "* %? [[%:link][%:description]] \nCaptured On: %U")
))
```

_Hint:_ You can put code in capture handlers via %() blocks. I use this mechanism to automatically close the newly crated frame in the L template. If anyone cares to know, I'll add the details.

# License
This repository is licensed as MIT license, see the LICENSE file for details.

[Org-Mode site]: http://orgmode.org/worg/org-contrib/org-protocol.html
[Chrome App Store]: https://chrome.google.com/webstore/detail/org-capture/kkkjlfejijcjgjllecmnejhogpbcigdc
