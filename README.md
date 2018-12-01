# Org Capture Extension

This is an extension for Google Chrome (tm) and Firefox (tm) which adds a "Capture" button, sending the site address, title, and selected text (if any) to emacs via org-protocol, see the [Org-Mode site] for instructions for setting that up org-protocol. The extentsion itself is available at the [Chrome App Store].

# Improvements

- Adding options for selecting the exact structure of the links that are constructed (e.g. for the benefit of people with '///' problems).
- There is always room to improve. Open a ticket with your ideas.

# Example Usage
[![Example Usage Video](https://img.youtube.com/vi/zKDHto-4wsU/0.jpg)](https://www.youtube.com/watch?v=zKDHto-4wsU)
![Example Usage Screenshot](https://dl.dropboxusercontent.com/s/x2xjgg7bnwuj6uv/Screenshot.png)

# Problems? Please [click here](#troubleshooting) or scroll to the bottom.

# Detailed setup instructions

## Install the extension

Either via the [Chrome App Store] or by dragging the extension folder to the "Extensions" tab in Chrome. If the latter is the chosen procedure then one needs to enable developer mode first, if I'm not mistaken. Note that if you choose to have a local-install, then you need to choose some icon and name it org-mode-unicorn.png, placing it in the extension's folder. Or, you can name it anything you want, but then you need to update manifest.json.

_Note_: The first time you use the extension, Chrome will ask you allow it to run ```open ....``` (on OSX) or ```xdg-open ...``` (on Linux), or ??? (On Windows). Those are the standard system mechanisms for dispatching a file/URL to the appropriate handler, so you should accept the request.

## Set up org-protocol

Detailed instructions available at [Org-Mode site].

The gist of it is to make your system recognize emacsclient as the handler of ```org-protocol://``` links. In addition, one needs to set up emacs to load org-protocol and to set up capture templates.

### Register emacsclient as the ```org-protocol``` handler

#### Under Linux

``` bash
cat > "${HOME}/.local/share/applications/org-protocol.desktop" << EOF
[Desktop Entry]
Name=org-protocol
Exec=emacsclient %u
Type=Application
Terminal=false
Categories=System;
MimeType=x-scheme-handler/org-protocol;
EOF
```

And then, for GTK-based DE:
``` bash
update-desktop-database ~/.local/share/applications/
```

For KDE5:
``` bash
kbuildsycoca5
xdg-mime default org-protocol.desktop x-scheme-handler/org-protocol
```
##### For KDE4
###### Note: This is a workaround to issue #16 - See comment [here](https://github.com/sprig/org-capture-extension/issues/16#issuecomment-305050310)

Create the file
*/usr/local/bin/emacs-capture*
```sh
#!/bin/bash

# HACK: workaround for a kde-open bug (feature?) that might have
#       eaten a colon from our argument, om nom nom
argv=()
for arg in "$@"; do
    re='s_^org-protocol:/+capture:?/+_org-protocol://capture://_'
    argv+=("$(echo -n "$arg" | sed -Ez "$re")")
done

# Note: feel free to add any other arguments you want,
#  e.g. emacsclient --alternate-editor= -c "${argv[@]}"
emacsclient "${argv[@]}"
```
And the file

*$HOME/.local/share/applications/emacs-capture.desktop*
```desktop
#!/usr/bin/env xdg-open
[Desktop Entry]
Name=Emacs Client
Exec=emacs-capture "%u"
Icon=emacs-icon
Type=Application
Terminal=false
MimeType=x-scheme-handler/org-protocol;
```

Finally, run

``` bash
kbuildsycoca4
sudo update-desktop-database
```

#### Under OSX

Start Applescript Editor. Paste the following snippet:

``` applescript
on emacsclient(input)
	do shell script "/Applications/Emacs.app/Contents/MacOS/bin-x86_64-10_9/emacsclient -n -c -a \"/Applications/Emacs.app/Contents/MacOS/Emacs\" '" & input & "'"
end emacsclient

on open location input
	emacsclient(input)
end open location

on open inputs
	repeat with raw_input in inputs
		set input to POSIX path of raw_input
		emacsclient(input)
	end repeat
end open

on run
	do shell script emacsclient("")
end run
```

Adjust the paths and save it (with 'type' as Application) under ```/Applications/EmacsClient.app``` (or whatever else you choose).
Edit (with Xcode) the file ```/Applications/Emacsclient.app/Contents/Info.plist```

And add there the following:
``` plist
<key>CFBundleURLTypes</key>
<array>
	<dict>
		<key>CFBundleURLName</key>
		<string>org-protocol</string>
		<key>CFBundleURLSchemes</key>
		<array>
			<string>org-protocol</string>
		</array>
	</dict>
</array>
```

and
``` plist
<key>CFBundleDocumentTypes</key>
<array>
	<dict>
		<key>CFBundleTypeExtensions</key>
		<array>
			<string>*</string>
		</array>
		<key>CFBundleTypeName</key>
		<string>All</string>
		<key>CFBundleTypeOSTypes</key>
		<array>
			<string>****</string>
		</array>
		<key>CFBundleTypeRole</key>
		<string>Viewer</string>
	</dict>
</array>
```

and restart the desktop. You can also download [EmacsClient.app.zip], which I prepared in advance, if you are lazy.

##### Install EmacsClient.app with homebrew cask

If you have Homebrew and [Homebrew-Cask](https://caskroom.github.io/) installed, you can also install [EmacsClient.app.zip] with `brew cask install emacsclient`

##### Frame Visibility

Under some setups the emacs frame does not appear on top. @dangom [proposes a workaround using hammerspoon](https://github.com/sprig/org-capture-extension/issues/46#issuecomment-379498419):

Add the following to your init.lua:

```lua
function emacsclientWatcher(appName, eventType, appObject)
  if (eventType == hs.application.watcher.activated) then
    if (appName == "Emacsclient") then
      -- Bring Emacs to Front
      hs.osascript.applescript('tell application "Emacs" to activate')
    end
  end
end
appWatcher = hs.application.watcher.new(emacsclientWatcher)
appWatcher:start()
```

#### Under Windows

Open the Registry Editor (Win-R, then type `regedit`). Within `HKEY_CLASSES_ROOT`, add a key called `org-protocol`. Within `org-protocol`, set the data for the string value with the name `(Default)`  to be `URL:org-protocol`, add another string value with name `URL Protocol` and no data, and add a key called `shell`.

Within `shell`, create a key called `open`.

Within `open`, create a key called `command`.

Within `command`, set the data for the string value with the name `(Default)` to `"C:\the\path\to\your\emacsclientw.exe" "%1"`, updating the path to point to your Emacs installation.

If you get stuck, see [this guide to registering a protocol handler](https://msdn.microsoft.com/en-us/library/aa767914\(v=vs.85\).aspx) and look at how registries are set up for other protocol handlers (`skype`, `ftp`, etc.). Most of your pre-existing protocol handlers have more config than you need.

### Set up handlers in emacs

If some text is selected before the button is clicked, then the following is sent to emacs:
```
org-protocol://capture:/p/<url>/<title>/selection>
```

If nothing is selected, then instead the following is sent:
```
org-protocol://capture:/L/<url>/<title>
```

This means that you need to have appropriate capture templates for "L" and for "p". Example templates below:

```lisp
(setq org-capture-templates `(
	("p" "Protocol" entry (file+headline ,(concat org-directory "notes.org") "Inbox")
        "* %^{Title}\nSource: %u, %c\n #+BEGIN_QUOTE\n%i\n#+END_QUOTE\n\n\n%?")
	("L" "Protocol Link" entry (file+headline ,(concat org-directory "notes.org") "Inbox")
        "* %? [[%:link][%:description]] \nCaptured On: %U")
))
```


_Hint:_ You can put code in capture handlers via %() blocks. I use this mechanism to automatically close the newly crated frame in the L template. If anyone cares to know, I'll add the details. Another example use is below.

[*Note*](https://github.com/sprig/org-capture-extension/issues/37): The `L` template above would break for links to pages having `[` and `]` characters in their page titles - notably ArXiv. To mitigae this, you can use the improved template, contributed by [Vincent Picaud](https://www.github.com/vincent-picaud):

```lisp
(defun transform-square-brackets-to-round-ones(string-to-transform)
  "Transforms [ into ( and ] into ), other chars left unchanged."
  (concat 
  (mapcar #'(lambda (c) (if (equal c ?[) ?\( (if (equal c ?]) ?\) c))) string-to-transform))
  )

(setq org-capture-templates `(
	("p" "Protocol" entry (file+headline ,(concat org-directory "notes.org") "Inbox")
        "* %^{Title}\nSource: %u, %c\n #+BEGIN_QUOTE\n%i\n#+END_QUOTE\n\n\n%?")	
	("L" "Protocol Link" entry (file+headline ,(concat org-directory "notes.org") "Inbox")
        "* %? [[%:link][%(transform-square-brackets-to-round-ones \"%:description\")]]\n")
))
```

#### Example: closins the frame after a capture

If you wish to automatically close the emacs frame after a capture, add the following template:

```lisp
("L" "Protocol Link" entry (file+headline ,(concat org-directory "notes.org") "Inbox")
 "* %? [[%:link][%:description]] %(progn (setq kk/delete-frame-after-capture 2) \"\")\nCaptured On: %U"
 :empty-lines 1)
```

and in the initialization of org-mode put:

```lisp
  ;; Kill the frame if one was created for the capture
  (defvar kk/delete-frame-after-capture 0 "Whether to delete the last frame after the current capture")

  (defun kk/delete-frame-if-neccessary (&rest r)
    (cond
     ((= kk/delete-frame-after-capture 0) nil)
     ((> kk/delete-frame-after-capture 1)
      (setq kk/delete-frame-after-capture (- kk/delete-frame-after-capture 1)))
     (t
      (setq kk/delete-frame-after-capture 0)
      (delete-frame))))

  (advice-add 'org-capture-finalize :after 'kk/delete-frame-if-neccessary)
  (advice-add 'org-capture-kill :after 'kk/delete-frame-if-neccessary)
  (advice-add 'org-capture-refile :after 'kk/delete-frame-if-neccessary)
```

# Troubleshooting

Is the extension not working as you expect? i.e., is it "broken"? You need to do some investigative
legwork. And if you open a ticket, provide enough information to help solve the problem!

Please describe your setup. Linux? Version. OSX? Version. Emacs? Version. org-mode? Version. Chrome? Version. How did
you get your system to send org-protocol links to emacs? Please provide the relevant capture templates.

Please find the simplest URL for which it fails (does it work on a simple address that contain only
alphanumeric characters and periods? and backslashes? and query parameters? and escaped characters?
etc.). Then open the developer console and look for the debug message that the extension gives and
add it to the ticket.

Open a terminal and run $open "COPIED-URL" (do not skip the quotes, unless what you are pasting
already has quotes around it). $open is simply open if you are on OSX and xdg-open if on
linux. COPIED-URL is obviously the url you pasted here in step 1. Does it work? Congrats, you found
where the problem is not (i.e. inside chrome). No? Does $open org-"protocol://capture:/p/a/b" work?
No? Again you found where the problem lies not. Otherwise proceed to step 3.

Call up the line you ran in the terminal with the non-working url. it will be of the form open
"org-protocol://capture:/<letter>/PIECE1/PIECE2/ with PIECE2 usually being longer and more complex
if you selected any text, and PIECE1 otherwise. Please edit the url until it is as short as possible
while still breaking (Note, % should always be proceeded by two digits/letters in the ranges 0-9 and
A-F so do not leave a percent sign with a single symbol following). You can probably trim one of the
pieces to be just one character. Add to the ticket the smallest breaking URL.

Try sending said URL directly to emacsclient, for good measure. Does it work? Again, congrats. If
you are using OSX, make sure that the emacsclient which you call is the correct one!

### P.S.
It is of course fine to ask for help with problems in your config as well.

# License
This repository is licensed as MIT license, see the LICENSE file for details.

[Org-Mode site]: http://orgmode.org/worg/org-contrib/org-protocol.html
[Chrome App Store]: https://chrome.google.com/webstore/detail/org-capture/kkkjlfejijcjgjllecmnejhogpbcigdc
[EmacsClient.app.zip]: https://github.com/sprig/org-capture-extension/raw/master/EmacsClient.app.zip
