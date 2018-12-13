# cbox-desktop-admin
ConnectBox desktop admin tool -> Electron executable for Windows, Mac and Linux

Already compiled installer for Windows is available here:
https://storage.googleapis.com/www.qombibox.net/cbox-admin-setup.exe

disk image for macOS here:
https://storage.cloud.google.com/www.qombibox.net/ConnectBoxDesktopAdmin-darwin-x64.dmg

and a zipped version, i. e. a smaller size download (must unzip manually):
https://storage.cloud.google.com/www.qombibox.net/ConnectBoxDesktopAdmin-darwin-x64.zip

When compiling from source code it is necessary to replace the Drivelist module with a precompiled version from here:
https://github.com/resin-io-modules/drivelist/releases

## Get Started

- **Install** from one of the installers above
- Insert an **empty USB stick** (or >100 MByte free space) while the ConnectBox Desktop Admin software is running. Select this USB, once it has been detected by the software.
- *Do NOT* yet manually configure anything on this USB! Instead select "Settings" from the top left menu and then select the entry **"Install sample test files on USB: ____".** Once the download and unzip has finished, then the software will automatically reload. Now check the playback of various media types, like audio / video /  ePub / e-Learning / read-out-loud. Check out demo content in several languages (English and Arabic) and select some additional demo books (from the top left menu)
- **add your own media content** by using the available plus buttons. **Please note:** First copy your own media content to the USB stick (and probably also copy suitable image files, to be used for each entry).
- **Test your content on a Connect Box** by first selecting "Settings" from the top left menu. Then select the entry "Install latest ConnectBox static host files on USB: ____" and wait until the download has finished. Then use the "eject USB" function on your computer, remove the USB and insert it on a ConnectBox. Make sure that the ConnectBox has been configured to use "Static host" mode.

## Backwards Compatibility

Any existing LibraryBox installation (on a USB stick) is automatically detected by the ConnectBox Desktop Admin software (incl. earlier versions of the BibleBox). You can then select to "upgrade" the USB format to the new ConnectBox format. **Please note:** First make a backup copy of this USB stick.

Any "upgraded" content only works on the LibraryBox hardware, however. There is still an option to create another ConnectBox installation on the very same USB stick and have this usable in parallel with the LibraryBox installation (both installations completely independent of each other, but potentially still using the same media content).
