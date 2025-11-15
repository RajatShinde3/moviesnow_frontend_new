// app/(protected)/title/[slug]/CastSection.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import type { Credit } from "@/lib/api/types";

export function CastSection({ credits }: { credits: Credit[] }) {
  const cast = credits.filter((c) => c.kind === "CAST").slice(0, 12);
  const crew = credits.filter((c) => c.kind === "CREW");

  const director = crew.find((c) => c.role?.toLowerCase() === "director");
  const writer = crew.find((c) => c.role?.toLowerCase() === "writer" || c.role?.toLowerCase() === "screenplay");

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Cast & Crew</h2>

      {/* Key Crew */}
      {(director || writer) && (
        <div className="flex flex-wrap gap-6 text-sm">
          {director && director.person && (
            <div>
              <span className="font-medium">Director:</span>{" "}
              <Link
                href={`/person/${director.person.slug || director.person_id}`}
                className="text-primary hover:underline"
              >
                {director.person.name}
              </Link>
            </div>
          )}
          {writer && writer.person && (
            <div>
              <span className="font-medium">Writer:</span>{" "}
              <Link
                href={`/person/${writer.person.slug || writer.person_id}`}
                className="text-primary hover:underline"
              >
                {writer.person.name}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Cast Grid */}
      {cast.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cast.map((credit) => (
            <Link
              key={credit.id}
              href={`/person/${credit.person?.slug || credit.person_id}`}
              className="group space-y-2"
            >
              {/* Profile Image */}
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                {credit.person?.profile_url ? (
                  <img
                    src={credit.person.profile_url}
                    alt={credit.person.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
                    <span className="text-4xl opacity-20">👤</span>
                  </div>
                )}
              </div>

              {/* Name & Character */}
              <div className="space-y-1">
                <p className="text-sm font-medium line-clamp-1">
                  {credit.person?.name || "Unknown"}
                </p>
                {credit.character && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {credit.character}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
