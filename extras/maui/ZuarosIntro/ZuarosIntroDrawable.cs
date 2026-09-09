using Microsoft.Maui.Graphics;

namespace Zuaros.Intro;

/// <summary>
/// Allocation-light renderer for the Zuaros orbital intro.
/// </summary>
public sealed class ZuarosIntroDrawable : IDrawable
{
    private const int TrailSampleCount = 6;

    private static readonly Color Gold = Color.FromArgb("#EDB466");
    private static readonly Color GoldBright = Color.FromArgb("#F6C580");
    private static readonly Color GoldMuted = Color.FromArgb("#B59A70");
    private static readonly Color SoftWhite = Color.FromArgb("#F1F0E9");

    private double _progress;
    private ZuarosIntroOptions _options;

    public ZuarosIntroDrawable()
        : this(new ZuarosIntroOptions())
    {
    }

    public ZuarosIntroDrawable(ZuarosIntroOptions options)
    {
        _options = options ?? throw new ArgumentNullException(nameof(options));
    }

    /// <summary>
    /// Current animation progress, clamped to the inclusive range 0–1.
    /// </summary>
    public double Progress
    {
        get => _progress;
        set => _progress = Math.Clamp(value, 0d, 1d);
    }

    public ZuarosIntroOptions Options
    {
        get => _options;
        set => _options = value ?? throw new ArgumentNullException(nameof(value));
    }

    public void Draw(ICanvas canvas, RectF dirtyRect)
    {
        float progress = (float)_progress;
        float exitOpacity = _options.AutoDismiss
            ? 1f - SmoothStep(ZuarosGeometry.AutoDismissStartProgress, 1f, progress)
            : 1f;

        canvas.SaveState();
        try
        {
            canvas.Alpha = exitOpacity;
            canvas.FillColor = _options.BackgroundColor;
            canvas.FillRectangle(dirtyRect.X, dirtyRect.Y, dirtyRect.Width, dirtyRect.Height);

            if (dirtyRect.Width <= 0f || dirtyRect.Height <= 0f || exitOpacity <= 0f)
            {
                return;
            }

            float logicalHeight = _options.ShowWordmark
                ? ZuarosGeometry.WordmarkCanvasHeight
                : 100f;
            float scale = MathF.Min(dirtyRect.Width / 100f, dirtyRect.Height / logicalHeight) * 0.82f;
            float originX = dirtyRect.X + (dirtyRect.Width - 100f * scale) * 0.5f;
            float originY = dirtyRect.Y + (dirtyRect.Height - logicalHeight * scale) * 0.5f;

            canvas.Translate(originX, originY);
            canvas.Scale(scale, scale);

            if (_options.ReducedMotion)
            {
                DrawReducedMotionFrame(canvas, progress, exitOpacity);
            }
            else
            {
                DrawAnimatedFrame(canvas, progress, exitOpacity);
            }
        }
        finally
        {
            canvas.RestoreState();
        }
    }

    private void DrawAnimatedFrame(ICanvas canvas, float progress, float exitOpacity)
    {
        float milliseconds = progress * ZuarosGeometry.IntroDurationMilliseconds;
        float ignitionIn = SmoothStep(
            ZuarosGeometry.IgnitionInStartMilliseconds,
            ZuarosGeometry.IgnitionInEndMilliseconds,
            milliseconds);
        float ignitionOut = 1f - SmoothStep(
            ZuarosGeometry.IgnitionOutStartMilliseconds,
            ZuarosGeometry.IgnitionOutEndMilliseconds,
            milliseconds);
        DrawIgnition(canvas, ignitionIn * ignitionOut, exitOpacity);

        DrawOrbits(canvas, milliseconds, exitOpacity);

        float particleReveal = SmoothStep(
            ZuarosGeometry.ParticleStartMilliseconds,
            ZuarosGeometry.ParticleEndMilliseconds,
            milliseconds);
        float trailSettle = SmoothStep(
            ZuarosGeometry.MotionSettleStartMilliseconds,
            ZuarosGeometry.MotionSettleEndMilliseconds,
            milliseconds);
        float trailOpacity = 1f - (1f - ZuarosGeometry.FinalTrailOpacity) * trailSettle;
        DrawParticles(
            canvas,
            ResolveMotionSeconds(milliseconds),
            particleReveal,
            trailOpacity,
            exitOpacity,
            drawTrails: true);

        float bodyReveal = SmoothStep(
            ZuarosGeometry.BodyStartMilliseconds,
            ZuarosGeometry.BodyEndMilliseconds,
            milliseconds);
        DrawCoreBody(canvas, bodyReveal, exitOpacity);

        float sparkReveal = SmoothStep(
            ZuarosGeometry.SparkStartMilliseconds,
            ZuarosGeometry.SparkEndMilliseconds,
            milliseconds);
        float sparkPulse = MathF.Sin(
            MathF.PI * Normalize(
                ZuarosGeometry.SparkStartMilliseconds,
                ZuarosGeometry.SparkPulseEndMilliseconds,
                milliseconds)) * sparkReveal;
        DrawSpark(canvas, sparkReveal, sparkPulse, exitOpacity);

        if (_options.ShowWordmark)
        {
            float wordmarkReveal = SmoothStep(
                ZuarosGeometry.WordmarkStartMilliseconds,
                ZuarosGeometry.WordmarkEndMilliseconds,
                milliseconds);
            DrawWordmark(canvas, wordmarkReveal, exitOpacity);
        }
    }

    private void DrawReducedMotionFrame(ICanvas canvas, float progress, float exitOpacity)
    {
        float reveal = SmoothStep(0.04f, 0.22f, progress);
        DrawOrbits(canvas, reveal, exitOpacity, useUnifiedReveal: true);
        DrawParticles(
            canvas,
            ResolveMotionSeconds(ZuarosGeometry.IntroDurationMilliseconds),
            reveal,
            0f,
            exitOpacity,
            drawTrails: false);
        DrawCoreBody(canvas, reveal, exitOpacity);
        DrawSpark(canvas, reveal, 0f, exitOpacity);

        if (_options.ShowWordmark)
        {
            DrawWordmark(canvas, reveal, exitOpacity);
        }
    }

    private static void DrawIgnition(ICanvas canvas, float opacity, float exitOpacity)
    {
        if (opacity <= 0f)
        {
            return;
        }

        canvas.FillColor = Gold;
        canvas.Alpha = opacity * exitOpacity * 0.055f;
        canvas.FillEllipse(42f, 42f, 16f, 16f);
        canvas.Alpha = opacity * exitOpacity * 0.12f;
        canvas.FillEllipse(46f, 46f, 8f, 8f);
        canvas.Alpha = opacity * exitOpacity * 0.86f;
        canvas.FillEllipse(49.45f, 49.45f, 1.1f, 1.1f);
    }

    private static void DrawOrbits(
        ICanvas canvas,
        float milliseconds,
        float exitOpacity,
        bool useUnifiedReveal = false)
    {
        canvas.StrokeColor = GoldMuted;
        canvas.StrokeSize = 0.42f;

        for (int index = 0; index < ZuarosGeometry.OrbitPaths.Length; index++)
        {
            float reveal = useUnifiedReveal
                ? milliseconds
                : SmoothStep(
                    ZuarosGeometry.OrbitStartMilliseconds +
                        index * ZuarosGeometry.OrbitStaggerMilliseconds,
                    ZuarosGeometry.OrbitStartMilliseconds +
                        ZuarosGeometry.OrbitDurationMilliseconds +
                        index * ZuarosGeometry.OrbitStaggerMilliseconds,
                    milliseconds);

            if (reveal <= 0f)
            {
                continue;
            }

            float hierarchyOpacity = index == 0 ? 0.40f : 0.31f;
            canvas.Alpha = reveal * hierarchyOpacity * exitOpacity;
            canvas.DrawPath(ZuarosGeometry.OrbitPaths[index]);
        }
    }

    private static void DrawParticles(
        ICanvas canvas,
        float elapsedSeconds,
        float reveal,
        float trailOpacity,
        float exitOpacity,
        bool drawTrails)
    {
        if (reveal <= 0f)
        {
            return;
        }

        for (int particleIndex = 0; particleIndex < ZuarosGeometry.Particles.Length; particleIndex++)
        {
            ref readonly ParticleDefinition particle = ref ZuarosGeometry.Particles[particleIndex];

            if (drawTrails)
            {
                canvas.FillColor = Gold;

                // Oldest first. Every sample uses an earlier TIME, so Direction is respected
                // naturally for both clockwise (+1) and counter-clockwise (-1) particles.
                for (int sample = TrailSampleCount; sample >= 1; sample--)
                {
                    float age = particle.TrailDurationSeconds * sample / TrailSampleCount;
                    float fade = 1f - sample / (TrailSampleCount + 1f);
                    ZuarosGeometry.ParticlePosition(
                        in particle,
                        elapsedSeconds - age,
                        out float trailX,
                        out float trailY);

                    float radius = particle.Radius * (0.22f + 0.46f * fade);
                    canvas.Alpha =
                        particle.Opacity *
                        0.56f *
                        fade *
                        fade *
                        reveal *
                        trailOpacity *
                        exitOpacity;
                    canvas.FillEllipse(trailX - radius, trailY - radius, radius * 2f, radius * 2f);
                }
            }

            ZuarosGeometry.ParticlePosition(
                in particle,
                elapsedSeconds,
                out float headX,
                out float headY);

            canvas.FillColor = GoldBright;
            canvas.Alpha = particle.Opacity * reveal * exitOpacity;
            canvas.FillEllipse(
                headX - particle.Radius,
                headY - particle.Radius,
                particle.Radius * 2f,
                particle.Radius * 2f);
        }
    }

    private static void DrawCoreBody(ICanvas canvas, float opacity, float exitOpacity)
    {
        if (opacity <= 0f)
        {
            return;
        }

        canvas.FillColor = Gold;
        canvas.Alpha = opacity * exitOpacity;
        canvas.FillPath(ZuarosGeometry.CoreBodyPath, WindingMode.NonZero);
    }

    private static void DrawSpark(ICanvas canvas, float opacity, float pulse, float exitOpacity)
    {
        if (opacity <= 0f)
        {
            return;
        }

        if (pulse > 0f)
        {
            float diameter = 7f + pulse * 3f;
            canvas.FillColor = Gold;
            canvas.Alpha = pulse * 0.09f * exitOpacity;
            canvas.FillEllipse(60.1f - diameter * 0.5f, 37f - diameter * 0.5f, diameter, diameter);
        }

        canvas.FillColor = Gold;
        canvas.Alpha = opacity * exitOpacity;
        canvas.FillPath(ZuarosGeometry.CoreSparkPath, WindingMode.NonZero);
    }

    private static void DrawWordmark(ICanvas canvas, float opacity, float exitOpacity)
    {
        if (opacity <= 0f)
        {
            return;
        }

        canvas.StrokeColor = SoftWhite;
        canvas.StrokeSize = 1.4f;
        canvas.StrokeLineCap = LineCap.Round;
        canvas.StrokeLineJoin = LineJoin.Round;
        canvas.Alpha = opacity * exitOpacity;
        canvas.DrawPath(ZuarosGeometry.WordmarkPath);
    }

    private static float ResolveMotionSeconds(float milliseconds)
    {
        if (milliseconds <= ZuarosGeometry.MotionSettleStartMilliseconds)
        {
            return ZuarosGeometry.MotionStartOffsetSeconds +
                milliseconds / 1000f * ZuarosGeometry.MotionRate;
        }

        float settleDurationSeconds =
            (ZuarosGeometry.MotionSettleEndMilliseconds -
                ZuarosGeometry.MotionSettleStartMilliseconds) / 1000f;
        float settleProgress = Normalize(
            ZuarosGeometry.MotionSettleStartMilliseconds,
            ZuarosGeometry.MotionSettleEndMilliseconds,
            milliseconds);
        float deceleratedTime =
            settleDurationSeconds *
            (settleProgress - settleProgress * settleProgress / 2f);
        return ZuarosGeometry.MotionStartOffsetSeconds +
            ZuarosGeometry.MotionSettleStartMilliseconds / 1000f *
            ZuarosGeometry.MotionRate +
            deceleratedTime * ZuarosGeometry.MotionRate;
    }

    private static float Normalize(float start, float end, float value)
    {
        if (end <= start)
        {
            return value >= end ? 1f : 0f;
        }

        return Math.Clamp((value - start) / (end - start), 0f, 1f);
    }

    private static float SmoothStep(float start, float end, float value)
    {
        float t = Normalize(start, end, value);
        return t * t * (3f - 2f * t);
    }
}
