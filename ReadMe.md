[![Build Status](https://dev.azure.com/JeremyTCD/Mimo/_apis/build/status/Mimo-CI)](https://dev.azure.com/JeremyTCD/Mimo/_build/latest?definitionId=8)

Mimo is not in a generally usable state. I'm currently waiting to see how [DocFX V3](https://github.com/dotnet/docfx/projects/1) turns out before I decide on whether or not to complete this project. DocFX V2 is slow, can't run cross platform and isn't easy to extend. With V3 on the horizon, and the non-compatibility of V2 plugins and themes, I'm disinclined to finish this project up for V2.

Unfortunately, for now, the Mimo package on NPM will not work without some hacking. I wrote a bunch of plugins for Mimo but due to V3 being on the horizon, they were written scrappily. No tests, held together by threads. I ended up dumping them into a single project [DocFx.Plugins](https://github.com/JeremyTCD/DocFx.Plugins) and publishing it to a private feed (since its temporary).
Additionally, DocFx.Plugins relies on a couple of [changes/fixes](https://github.com/JeremyTCD/docfx) made to V2.
