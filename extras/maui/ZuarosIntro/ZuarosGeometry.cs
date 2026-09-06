using Microsoft.Maui.Graphics;

namespace Zuaros.Intro;

/// <summary>
/// Geometry algorithms used by the MAUI intro. Brand coordinates and paths are generated
/// from <c>src/brand/zuaros-master.svg</c> into <c>ZuarosGeometry.Generated.cs</c>.
/// </summary>
public static partial class ZuarosGeometry
{
    private const int OrbitSegments = 96;
    internal static void PointOnOrbit(
        in OrbitDefinition orbit,
        float turns,
        out float x,
        out float y)
    {
        turns -= MathF.Floor(turns);
        float angle = turns * MathF.Tau;
        float rotation = orbit.RotationDegrees * MathF.PI / 180f;
        float ellipseX = orbit.RadiusX * MathF.Cos(angle);
        float ellipseY = orbit.RadiusY * MathF.Sin(angle);
        float cosine = MathF.Cos(rotation);
        float sine = MathF.Sin(rotation);

        x = CenterX + ellipseX * cosine - ellipseY * sine;
        y = CenterY + ellipseX * sine + ellipseY * cosine;
    }

    internal static void ParticlePosition(
        in ParticleDefinition particle,
        float seconds,
        out float x,
        out float y)
    {
        ref readonly OrbitDefinition orbit = ref Orbits[particle.OrbitIndex];
        float turns = particle.PhaseTurns + particle.Direction * seconds / particle.PeriodSeconds;
        PointOnOrbit(in orbit, turns, out x, out y);
    }

    private static PathF[] CreateOrbitPaths()
    {
        PathF[] paths = new PathF[Orbits.Length];
        for (int orbitIndex = 0; orbitIndex < Orbits.Length; orbitIndex++)
        {
            ref readonly OrbitDefinition orbit = ref Orbits[orbitIndex];
            PathF path = new();
            for (int segment = 0; segment < OrbitSegments; segment++)
            {
                float turns = segment / (float)OrbitSegments;
                PointOnOrbit(in orbit, turns, out float x, out float y);
                if (segment == 0)
                {
                    path.MoveTo(x, y);
                }
                else
                {
                    path.LineTo(x, y);
                }
            }

            path.Close();
            paths[orbitIndex] = path;
        }

        return paths;
    }

}

internal readonly struct OrbitDefinition
{
    internal OrbitDefinition(float radiusX, float radiusY, float rotationDegrees)
    {
        RadiusX = radiusX;
        RadiusY = radiusY;
        RotationDegrees = rotationDegrees;
    }

    internal float RadiusX { get; }
    internal float RadiusY { get; }
    internal float RotationDegrees { get; }
}

internal readonly struct ParticleDefinition
{
    internal ParticleDefinition(
        int orbitIndex,
        float periodSeconds,
        float phaseTurns,
        float direction,
        float radius,
        float opacity,
        float trailDurationSeconds)
    {
        OrbitIndex = orbitIndex;
        PeriodSeconds = periodSeconds;
        PhaseTurns = phaseTurns;
        Direction = direction;
        Radius = radius;
        Opacity = opacity;
        TrailDurationSeconds = trailDurationSeconds;
    }

    internal int OrbitIndex { get; }
    internal float PeriodSeconds { get; }
    internal float PhaseTurns { get; }
    internal float Direction { get; }
    internal float Radius { get; }
    internal float Opacity { get; }
    internal float TrailDurationSeconds { get; }
}
