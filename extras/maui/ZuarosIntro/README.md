# Zuaros intro for .NET MAUI

This folder is a dependency-free (beyond .NET MAUI itself) reference implementation of the Zuaros in-app studio intro. It uses one `GraphicsView`, one `IDrawable`, and MAUI's native `Animation` clock. The complete default sequence lasts 2.8 seconds.

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
    Duration = TimeSpan.FromMilliseconds(2800),
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

The recommended hybrid balances studio recognition with launch speed: the wordmark appears only after the orbital identity is established, remains readable through resolution, and shares the final 450 ms hold. `AutoDismiss` uses only the last 140 ms for its optional crossfade; disable it to retain the completed frame.

## Geometry and rendering notes

`src/brand/zuaros-master.svg` is the vector master. Running `npm run brand` from the website repository regenerates the React JSON manifest, `ZuarosGeometry.Generated.cs`, and the native splash from it. The generated `PathF` paths, center, transforms, orbit radii, rotations, particle definitions, and outlined wordmark therefore stay aligned with the React intro and SVG exports without requiring a device font.

The composition is centered from a normalized 100-unit coordinate system and scales from the shorter viewport dimension. It therefore does not depend on a particular phone or landscape aspect ratio.

Each particle head is evaluated at time `t`. Its six trail samples are evaluated at `t - age`; direction is part of the position function. This keeps the trail behind the head for both clockwise and counter-clockwise particles instead of relying on a directional gradient.

All paths, orbit tables, and particle tables are allocated once. A frame only updates scalar progress, evaluates trigonometry, and issues drawing commands; it creates no per-frame collections, images, or layout elements.

## Timing

At the default 2.8 seconds:

1. central ignition: approximately 0–580 ms;
2. Z reveal: approximately 170–650 ms;
3. spark pulse: approximately 440–850 ms;
4. staggered orbit activation: approximately 560–1,355 ms;
5. particle movement and physically sampled trails: begins around 720 ms and decelerates from 1,950–2,350 ms;
6. optional wordmark: fades in from approximately 1,500–1,760 ms;
7. completed identity: stable final hold from 2,350–2,800 ms;
8. optional auto-dismiss crossfade: final 140 ms, contained within that hold.

Keep production durations short enough for launch while preserving the formation, resolution, and final hold. The native splash background and intro background should both use graphite `#101211` to avoid a startup flash.
