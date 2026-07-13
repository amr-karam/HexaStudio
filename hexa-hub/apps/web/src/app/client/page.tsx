'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { useSocket } from '@/providers/SocketProvider';
import axios from 'axios';
import { Briefcase, Bell, FileText, Loader2 } from 'lucide-react';

interface ProjectSummary {
  id: string;
  name: string;
  status: string;
}

export default function ClientDashboard() {
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    const fetchClientData = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/client/workspaces`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to fetch client projects', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [token, API_URL]);

  useEffect(() => {
    if (!socket) return;

    socket.on('notification', (notification: any) => {
      if (notification.userId === user?.id) {
        setNotifications((prev) => [notification, ...prev]);
      }
    });

    return () => {
      socket.off('notification');
    };
  }, [socket, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <Loader2 className="text-gold animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-serif font-light text-white mb-2">Welcome back, <span className="text-gold">{user?.fullName || 'Client'}</span></h1>
        <p className="text-neutral-500 font-light text-lg">Your project overview at a glance.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="p-8 bg-surface border border-border rounded-3xl">
          <Briefcase className="text-gold mb-4" size={32} />
          <h3 className="text-neutral-400 text-sm uppercase tracking-widest mb-1">Active Projects</h3>
          <div className="text-3xl font-serif text-white">{projects.length}</div>
        </div>
        <div className="p-8 bg-surface border border-border rounded-3xl">
          <Bell className="text-gold mb-4" size={32} />
          <h3 className="text-neutral-400 text-sm uppercase tracking-widest mb-1">Notifications</h3>
          <div className="text-3xl font-serif text-white">{notifications.length}</div>
        </div>
        <div className="p-8 bg-surface border border-border rounded-3xl">
          <FileText className="text-gold mb-4" size={32} />
          <h3 className="text-neutral-400 text-sm uppercase tracking-widest mb-1">Documents</h3>
          <div className="text-3xl font-serif text-white">0</div>
        </div>
      </div>

      <h2 className="text-2xl font-serif text-white mb-6">Your Projects</h2>
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-surface border border-border rounded-2xl cursor-pointer"
            >
              <h3 className="text-lg font-medium text-white mb-2">{project.name}</h3>
              <p className="text-sm text-neutral-500 capitalize">{project.status}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-12 bg-surface border border-border rounded-3xl text-center">
          <p className="text-neutral-500 font-light italic text-lg">
            No active projects found.
          </p>
        </div>
      )}
    </div>
  );
}
