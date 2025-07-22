
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Edit, Download, Trash2 } from "lucide-react"

interface SongLibraryProps {
  userId: number
  onEditSong: (song: any) => void
}

export default function SongLibrary({ userId, onEditSong }: SongLibraryProps) {
  const [songs, setSongs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGenre, setFilterGenre] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [playingSong, setPlayingSong] = useState<number | null>(null)

  // Mock songs data
  useEffect(() => {
    const mockSongs = [
      {
        id: 1,
        title: "Digital Dreams",
        genre: "electronic",
        mood: "energetic",
        tempo: 128,
        duration: 180,
        createdAt: "2024-01-15",
        status: "completed",
        audioUrl: "/mock-song-1.mp3"
      },
      {
        id: 2,
        title: "Midnight Reflections",
        genre: "pop",
        mood: "melancholy",
        tempo: 95,
        duration: 210,
        createdAt: "2024-01-12",
        status: "completed",
        audioUrl: "/mock-song-2.mp3"
      },
      {
        id: 3,
        title: "Summer Vibes",
        genre: "reggae",
        mood: "happy",
        tempo: 110,
        duration: 195,
        createdAt: "2024-01-10",
        status: "completed",
        audioUrl: "/mock-song-3.mp3"
      }
    ]
    setSongs(mockSongs)
  }, [])

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = filterGenre === "all" || song.genre === filterGenre
    return matchesSearch && matchesGenre
  })

  const sortedSongs = [...filteredSongs].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "title":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handlePlayPause = (songId: number) => {
    setPlayingSong(playingSong === songId ? null : songId)
  }

  const handleDelete = (songId: number) => {
    setSongs(songs.filter(song => song.id !== songId))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white">Your Song Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Select value={filterGenre} onValueChange={setFilterGenre}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="pop">Pop</SelectItem>
                <SelectItem value="electronic">Electronic</SelectItem>
                <SelectItem value="reggae">Reggae</SelectItem>
                <SelectItem value="rock">Rock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {sortedSongs.map((song) => (
              <Card key={song.id} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlayPause(song.id)}
                        className="text-white hover:bg-white/10"
                      >
                        {playingSong === song.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <div>
                        <h3 className="text-white font-medium">{song.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Badge variant="secondary" className="text-xs">
                            {song.genre}
                          </Badge>
                          <span>{formatDuration(song.duration)}</span>
                          <span>{song.tempo} BPM</span>
                          <span>{formatDate(song.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditSong(song)}
                        className="text-white hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/10"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(song.id)}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedSongs.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No songs found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
