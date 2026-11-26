'use client';

import {useState, useEffect} from 'react';
import {useAuth} from '@/hooks/use-auth';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {User, Mail, Calendar, MapPin, LinkIcon, Edit3, Save, X} from 'lucide-react';
import {Header} from '@/components/Header/Header';
import {redirect} from 'next/navigation';

export default function ProfilePage() {
  const {user, isAuthenticated, isLoading} = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: 'Full-stack developer passionate about building great user experiences.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    company: 'Acme Corp',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect('/');
    }
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: 'Full-stack developer passionate about building great user experiences.',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        company: 'Acme Corp',
      });
    }
  }, [user, isAuthenticated, isLoading]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: 'Full-stack developer passionate about building great user experiences.',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        company: 'Acme Corp',
      });
    }
    setIsEditing(false);
  };

  const stats = [
    {label: 'Projects', value: '24'},
    {label: 'Organizations', value: '3'},
    {label: 'Contributions', value: '1,247'},
    {label: 'Followers', value: '89'},
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'Mobile App Redesign',
      description: 'Complete UI/UX overhaul for mobile application',
      status: 'In Progress',
      lastUpdated: '2 days ago',
    },
    {
      id: 2,
      name: 'API Documentation',
      description: 'Comprehensive API documentation and examples',
      status: 'Completed',
      lastUpdated: '1 week ago',
    },
    {
      id: 3,
      name: 'Team Dashboard',
      description: 'Analytics dashboard for team performance metrics',
      status: 'Planning',
      lastUpdated: '3 days ago',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>
          <CardContent className="relative pt-0 pb-6">
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="flex items-end space-x-4">
                <Avatar className="w-24 h-24 border-4 border-background">
                  <AvatarImage src={user?.avatar || '/placeholder.svg'} alt={user?.name} />
                  <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="pb-2">
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="text-2xl font-bold bg-transparent border-b border-border focus:border-primary"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-foreground">{formData.name}</h1>
                  )}
                  <p className="text-muted-foreground">@{user?.username}</p>
                </div>
              </div>
              <div className="pb-2">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Bio and Details */}
            <div className="space-y-4">
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-foreground">{formData.bio}</p>
              )}

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {isEditing ? (
                    <Input
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      className="h-6 text-sm bg-transparent border-b border-border focus:border-primary"
                    />
                  ) : (
                    formData.company
                  )}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {isEditing ? (
                    <Input
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="h-6 text-sm bg-transparent border-b border-border focus:border-primary"
                    />
                  ) : (
                    formData.location
                  )}
                </div>
                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  {isEditing ? (
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={e => setFormData({...formData, website: e.target.value})}
                      className="h-6 text-sm bg-transparent border-b border-border focus:border-primary"
                    />
                  ) : (
                    <a href={formData.website} className="text-primary hover:underline">
                      {formData.website}
                    </a>
                  )}
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {formData.email}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined March 2023
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest work and contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map(project => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">Updated {project.lastUpdated}</p>
                  </div>
                  <Badge
                    variant={
                      project.status === 'Completed'
                        ? 'default'
                        : project.status === 'In Progress'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
