using Microsoft.Maui.Controls;
using Microsoft.Maui.Dispatching;
using Microsoft.Maui.Graphics;

namespace Zuaros.Intro;

/// <summary>
/// Drop-in in-app studio intro. It starts when loaded and raises <see cref="Completed"/>
/// after its short animation finishes.
/// </summary>
public sealed class ZuarosIntroView : ContentView
{
    private const string AnimationName = "ZuarosIntro.Playback";
    private const uint FrameRateMilliseconds = 16;

    private readonly GraphicsView _graphicsView;
    private readonly ZuarosIntroDrawable _drawable;
    private ZuarosIntroOptions _options;
    private TaskCompletionSource? _playbackCompletion;
    private long _playbackGeneration;

    public ZuarosIntroView()
        : this(new ZuarosIntroOptions())
    {
    }

    public ZuarosIntroView(ZuarosIntroOptions options)
    {
        _options = options ?? throw new ArgumentNullException(nameof(options));
        _drawable = new ZuarosIntroDrawable(_options);
        _graphicsView = new GraphicsView
        {
            Drawable = _drawable,
            HorizontalOptions = LayoutOptions.Fill,
            VerticalOptions = LayoutOptions.Fill,
        };

        Content = _graphicsView;
        BackgroundColor = Colors.Transparent;
        HorizontalOptions = LayoutOptions.Fill;
        VerticalOptions = LayoutOptions.Fill;

        Loaded += OnLoaded;
        Unloaded += OnUnloaded;
    }

    /// <summary>
    /// Raised only after natural completion, not when the view unloads or <see cref="Stop"/> is called.
    /// </summary>
    public event EventHandler? Completed;

    public bool IsRunning { get; private set; }

    public ZuarosIntroOptions Options
    {
        get => _options;
        set
        {
            _options = value ?? throw new ArgumentNullException(nameof(value));
            _drawable.Options = _options;
            _graphicsView.Invalidate();
        }
    }

    /// <summary>
    /// Replays the intro. Calls from a worker thread are marshalled to the MAUI dispatcher.
    /// </summary>
    public Task PlayAsync()
    {
        if (Dispatcher.IsDispatchRequired)
        {
            return Dispatcher.DispatchAsync(PlayOnUiThreadAsync);
        }

        return PlayOnUiThreadAsync();
    }

    /// <summary>
    /// Stops playback without raising <see cref="Completed"/>.
    /// </summary>
    public void Stop()
    {
        if (Dispatcher.IsDispatchRequired)
        {
            Dispatcher.Dispatch(StopOnUiThread);
            return;
        }

        StopOnUiThread();
    }

    private Task PlayOnUiThreadAsync()
    {
        ValidateOptions();
        StopOnUiThread();

        _playbackCompletion = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        long generation = ++_playbackGeneration;
        IsRunning = true;
        IsVisible = true;
        _drawable.Options = _options;
        _drawable.Progress = 0d;
        _graphicsView.Invalidate();

        double roundedMilliseconds = Math.Round(_options.Duration.TotalMilliseconds);
        uint durationMilliseconds = (uint)Math.Clamp(roundedMilliseconds, 1d, uint.MaxValue);

        Animation animation = new(
            value =>
            {
                _drawable.Progress = value;
                _graphicsView.Invalidate();
            },
            0d,
            1d,
            Easing.Linear);

        animation.Commit(
            this,
            AnimationName,
            FrameRateMilliseconds,
            durationMilliseconds,
            Easing.Linear,
            (_, wasCanceled) => OnAnimationFinished(generation, wasCanceled));

        return _playbackCompletion.Task;
    }

    private void OnAnimationFinished(long generation, bool wasCanceled)
    {
        if (!IsRunning || generation != _playbackGeneration)
        {
            return;
        }

        IsRunning = false;
        TaskCompletionSource? completion = _playbackCompletion;
        _playbackCompletion = null;

        if (!wasCanceled)
        {
            _drawable.Progress = 1d;
            _graphicsView.Invalidate();

            if (_options.AutoDismiss)
            {
                IsVisible = false;
            }

            Completed?.Invoke(this, EventArgs.Empty);
        }

        completion?.TrySetResult();
    }

    private void StopOnUiThread()
    {
        if (!IsRunning)
        {
            return;
        }

        IsRunning = false;
        _playbackGeneration++;
        this.AbortAnimation(AnimationName);
        TaskCompletionSource? completion = _playbackCompletion;
        _playbackCompletion = null;
        completion?.TrySetResult();
    }

    private void ValidateOptions()
    {
        if (_options.Duration <= TimeSpan.Zero)
        {
            throw new InvalidOperationException("Zuaros intro Duration must be greater than zero.");
        }

        if (_options.BackgroundColor is null)
        {
            throw new InvalidOperationException("Zuaros intro BackgroundColor cannot be null.");
        }
    }

    private void OnLoaded(object? sender, EventArgs eventArgs)
    {
        if (!IsRunning)
        {
            _ = PlayAsync();
        }
    }

    private void OnUnloaded(object? sender, EventArgs eventArgs)
    {
        StopOnUiThread();
    }
}
