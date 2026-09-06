# Zuaros intro for .NET MAUI

This folder is a dependency-free (beyond .NET MAUI itself) reference implementation of the Zuaros in-app studio intro. It uses one `GraphicsView`, one `IDrawable`, and MAUI's native `Animation` clock. The default hybrid sequence lasts 1.9 seconds.

The operating-system splash must remain static. Use `Resources/Splash/zuaros-splash.svg` for native startup, then show `ZuarosIntroView` as the first in-app layer after initialization.

## Integration

Either reference `ZuarosIntro.csproj` from a MAUI solution or copy these five C# files into the game project:

- `ZuarosGeometry.cs`
- `ZuarosGeometry.Generated.cs`
- `ZuarosIntroOptions.cs`
- `ZuarosIntroDrawable.cs`
- `ZuarosIntroView.cs`

If the game targets a .NET version other than the sample project's .NET 10 target, copying the files is the simplest route; the APIs used are available in supported MAUI releases from .NET 8 onward.

Copy the splash SVG to the game's `Resources/Splash` directory and add or replace the app's splash item:

```xml
<MauiSplashScreen
    Include="Resources\Splash\zuaros-splash.svg"
    Color="#101211"
    BaseSize="128,128" />
```

Place the game content and intro in the same root grid so the intro starts over an already-initialized first screen:

```csharp
using Zuaros.Intro;

var gameContent = new GameHomeView();
var intro = new ZuarosIntroView(new ZuarosIntroOptions
{
    ShowWordmark = true,
    Duration = TimeSpan.FromMilliseconds(1900),
    BackgroundColor = Color.FromArgb("#101211"),
    AutoDismiss = true,
    ReducedMotion = accessibilitySettings.ReduceMotion,
});

intro.Completed += (_, _) => gameContent.Focus();
Content = new Grid { Children = { gameContent, intro } };
```

The view plays on `Loaded`. Call `await intro.PlayAsync()` to replay it, or `intro.Stop()` when leaving the page. `AutoDismiss = true` crossfades to the prepared game content and then sets the intro view invisible. With `AutoDismiss = false`, the finished mark remains on screen.

## Variants

- **Symbol only:** `ShowWordmark = false`. Best between launch and a game's own title screen.
- **Studio wordmark / recommended hybrid:** `ShowWordmark = true`. The Z ignites, four orbits activate in sequence, four particles move, and the outlined `zuaros` wordmark appears for the final recognition beat before a quick crossfade.
- **Reduced motion:** `ReducedMotion = true`. The final emblem crossfades in as one restrained composition; particles are stationary and trails are omitted. Set this from the host app's accessibility preference.

The recommended hybrid balances studio recognition with launch speed: the wordmark is fully visible for about 340 ms and present for roughly 720 ms from the start of its fade through the optional exit.

## Geometry and rendering notes

`src/brand/zuaros-master.svg` is the vector master. Running `npm run brand` from the website repository regenerates the React JSON manifest, `ZuarosGeometry.Generated.cs`, and the native splash from it. The generated `PathF` paths, center, transforms, orbit radii, rotations, particle definitions, and outlined wordmark therefore stay aligned with the React intro and SVG exports without requiring a device font.

The composition is centered from a normalized 100-unit coordinate system and scales from the shorter viewport dimension. It therefore does not depend on a particular phone or landscape aspect ratio.

Each particle head is evaluated at time `t`. Its six trail samples are evaluated at `t - age`; direction is part of the position function. This keeps the trail behind the head for both clockwise and counter-clockwise particles instead of relying on a directional gradient.

All paths, orbit tables, and particle tables are allocated once. A frame only updates scalar progress, evaluates trigonometry, and issues drawing commands; it creates no per-frame collections, images, or layout elements.

## Timing

At the default 1.9 seconds:

1. central ignition: approximately 0–210 ms;
2. Z reveal: approximately 190–680 ms;
3. spark pulse: approximately 530–860 ms;
4. staggered orbit activation: approximately 650–1,360 ms;
5. particle movement and physically sampled trails: approximately 910–1,710 ms;
6. optional wordmark: fades in from approximately 1,180–1,370 ms, then holds for about 340 ms before the optional exit;
7. optional auto-dismiss crossfade: final 190 ms.

Keep production durations in the requested 1.5–2.2 second range. The native splash background and intro background should both use graphite `#101211` to avoid a startup flash.
