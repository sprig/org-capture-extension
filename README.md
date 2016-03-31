# Org Capture Extension

This is an extension for Google Chrome (tm) which adds a "Capture" button, sending the site address, title, and selected text (if any) to emacs via org-protocol, see the [Org-Mode site] for instructions for setting that up org-protocol. The extentsion itself is available at the [Chrome App Store].

# Improvements

This extension has room for improvement; Specifically, people would probably like to choose template letters other than the ones I picked for them. If you wish to add a small "options" page with an ability to select handler letters, that would be cool.

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

And then (for non-KDE)
``` bash
update-desktop-database ~/.local/share/applications/
```

#### Under OSX

Start Applescript Editor. Paste the following snippet:

``` applescript
set emacsclient to "/Applications/Emacs.app/Contents/MacOS/bin-x86_64-10_9/emacsclient -n -c -a \"/Applications/Emacs.app/Contents/MacOS/Emacs\""

on open location input
	do shell script  emacsclient & "\"" & input & "\""
end open location

on open inputs
	repeat with raw_input in inputs
		set input to POSIX path of raw_input
		do shell script emacsclient & "\"" & input & "\""
	end repeat
end open

on run
	do shell script emacsclient
end run
```

And save it (with 'type' as Application) under ```/Applications/EmacsClient.app``` (or whatever else you choose).
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

#### Under Windows

See instructions on [Org-Mode site], and contribute them here with a pull request :-).

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
[EmacsClient.app.zip]: https://github.com/sprig/org-capture-extension/raw/master/EmacsClient.app.zip
