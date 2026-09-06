using Microsoft.Maui.Graphics;

namespace Zuaros.Intro;

/// <summary>
/// Controls the short in-app Zuaros studio intro.
/// </summary>
public sealed class ZuarosIntroOptions
{
    /// <summary>
    /// Shows the outlined Zuaros wordmark below the orbital emblem near the end.
    /// Set this to <see langword="false"/> for the symbol-only variant.
    /// </summary>
    public bool ShowWordmark { get; set; } = true;

    /// <summary>
    /// Total playback length. The recommended hybrid timing is 1.9 seconds.
    /// </summary>
    public TimeSpan Duration { get; set; } = TimeSpan.FromMilliseconds(1900);

    /// <summary>
    /// Color painted behind the intro. The default is Zuaros graphite.
    /// </summary>
    public Color BackgroundColor { get; set; } = Color.FromArgb("#101211");

    /// <summary>
    /// Fades the complete view out and sets it invisible when playback finishes.
    /// When false, the final emblem remains visible.
    /// </summary>
    public bool AutoDismiss { get; set; } = true;

    /// <summary>
    /// Replaces orbit motion, trails, scale changes, and the staged reveal with a restrained crossfade.
    /// The host app should set this from its accessibility preference.
    /// </summary>
    public bool ReducedMotion { get; set; }
}
