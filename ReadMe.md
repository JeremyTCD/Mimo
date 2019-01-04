[![Build Status](https://dev.azure.com/JeremyTCD/Mimo/_apis/build/status/Mimo-CI)](https://dev.azure.com/JeremyTCD/Mimo/_build/latest?definitionId=8)

Mimo is a tool that dynamically generates DocFX themes and websites from said themes.  

Mimo is not in a generally usable state. I'm waiting to see how [DocFX V3](https://github.com/dotnet/docfx/projects/1) turns out before deciding on whether or not to complete this project. 
Mimo is currently scrappily built on top of DocFX V2, which has performance issues, can't run cross platform and isn't easy to extend.

Unfortunately, for now, the Mimo package on NPM does not work without some hacking. It depends on a bunch of plugins for DocFX V2. 
I've collated all of the plugins into a temporary open-source project [JeremyTCD.DocFx.Plugins](https://github.com/JeremyTCD/DocFx.Plugins).
Note that JeremyTCD.DocFx.Plugins relies on a couple of [changes/fixes](https://github.com/JeremyTCD/docfx) made to DocFX V2.
