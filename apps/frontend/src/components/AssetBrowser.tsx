"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface AssetModel {
  id: string;
  name: string;
  category: "architecture" | "furniture" | "decoration" | "landscape";
  url: string;
  thumbnail: string;
  size: string;
  license: string;
  compatibleWith: string[];
}

interface AssetBrowserProps {
  onModelSelected: (url: string, id: string) => void;
}

export default function AssetBrowser({ onModelSelected }: AssetBrowserProps) {
  const [models, setModels] = useState<AssetModel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/assets/models")
      .then((r) => r.json())
      .then((data) => {
        setModels(data.models || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = models.filter((m) => {
    const matchesCategory =
      selectedCategory === "all" || m.category === selectedCategory;
    const matchesSearch = m.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(models.map((m) => m.category)));

  return (
    <div className="fixed right-4 bottom-4 z-40 w-64 bg-sl-card border border-sl-border rounded-lg shadow-xl overflow-hidden">
      <div className="p-3 border-b border-sl-border">
        <h3 className="text-sl-gold font-medium text-xs uppercase tracking-wider">
          Asset Library
        </h3>
      </div>

      <div className="p-2 space-y-2">
        {/* Search */}
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-2 py-1 text-xs rounded bg-sl-void border border-sl-border text-sl-alabaster"
        />

        {/* Category filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-2 py-1 text-xs rounded ${
              selectedCategory === "all"
                ? "bg-sl-gold text-sl-void"
                : "bg-sl-void text-sl-muted hover:text-sl-alabaster"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 text-xs rounded capitalize ${
                selectedCategory === cat
                  ? "bg-sl-gold text-sl-void"
                  : "bg-sl-void text-sl-muted hover:text-sl-alabaster"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Asset list */}
        {loading && <p className="text-xs text-sl-muted">Loading assets…</p>}
        {error && <p className="text-xs text-destructive">Error: {error}</p>}

        {!loading && !error && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-sl-muted">No assets found.</p>
            ) : (
              filtered.map((model) => (
                <button
                  key={model.id}
                  onClick={() => onModelSelected(model.url, model.id)}
                  className="w-full flex items-center gap-2 p-2 rounded hover:bg-sl-surface transition-colors text-left"
                >
                  <Image
                    src={model.thumbnail || "/placeholder.svg"}
                    alt={model.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded border border-sl-border bg-sl-void object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Crect width='40' height='40' fill='%230a0a0b'/%3E";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sl-alabaster font-medium text-xs truncate">
                      {model.name}
                    </p>
                    <p className="text-xs text-sl-muted">
                      {model.category} • {model.size}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-sl-muted text-center pb-2">
        Self-hosted • 5 Egyptian assets • Offline
      </p>
    </div>
  );
}
