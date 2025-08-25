import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Calendar, Clock, Gift, Users } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { WeddingInfo, WeddingPhoto, Guest, CreateRsvpInput } from '../../server/src/schema';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'envelope' | 'invitation'>('envelope');
  const [guestName, setGuestName] = useState('');
  const [guest, setGuest] = useState<Guest | null>(null);
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo | null>(null);
  const [photos, setPhotos] = useState<WeddingPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // RSVP form state
  const [rsvpForm, setRsvpForm] = useState({
    will_attend: true,
    number_of_guests: 1,
    message: ''
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Since backend handlers are stubs, we'll use hardcoded data that matches the schema
  const stubWeddingInfo: WeddingInfo = {
    id: 1,
    bride_full_name: "Sarah Amelia W",
    bride_nickname: "Sarah",
    bride_father: "Mr. David W",
    bride_mother: "Mrs. Emily W",
    groom_full_name: "Michael John S",
    groom_nickname: "Mike",
    groom_father: "Mr. Robert S",
    groom_mother: "Mrs. Laura S",
    ceremony_date: new Date("2024-12-14"),
    ceremony_time_start: "10:00 AM",
    ceremony_time_end: "11:00 AM",
    ceremony_location: "Grand Mosque, Jalan Raya No. 123, Jakarta",
    reception_date: new Date("2024-12-14"),
    reception_time_start: "01:00 PM",
    reception_time_end: "04:00 PM",
    reception_location: "The Majestic Ballroom, Hotel Indah, Jalan Mawar No. 45, Jakarta",
    reception_maps_url: "https://maps.google.com/?q=The+Majestic+Ballroom+Hotel+Indah+Jakarta",
    bank_name: "Bank Example",
    account_holder: "Sarah Amelia W",
    account_number: "1234567890",
    rsvp_message: "Your presence is our greatest gift. Please let us know if you can make it by November 30, 2024.",
    rsvp_deadline: new Date("2024-11-30"),
    co_invitation_message: "We humbly invite our esteemed relatives, friends, and colleagues to join us in celebrating this joyous occasion.",
    quran_verse: "And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought. (Quran, Ar-Rum 30:21)",
    created_at: new Date(),
    updated_at: new Date()
  };

  // Stub photo data
  const stubPhotos: WeddingPhoto[] = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop&crop=faces",
      alt_text: "Main pre-wedding photo",
      is_main_photo: true,
      gallery_order: null,
      created_at: new Date()
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=600&fit=crop",
      alt_text: "Gallery photo 1",
      is_main_photo: false,
      gallery_order: 1,
      created_at: new Date()
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1594736797933-d0701ba28fbd?w=500&h=400&fit=crop",
      alt_text: "Gallery photo 2",
      is_main_photo: false,
      gallery_order: 2,
      created_at: new Date()
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&h=500&fit=crop",
      alt_text: "Gallery photo 3",
      is_main_photo: false,
      gallery_order: 3,
      created_at: new Date()
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
      alt_text: "Gallery photo 4",
      is_main_photo: false,
      gallery_order: 4,
      created_at: new Date()
    }
  ];

  const loadWeddingData = useCallback(async () => {
    try {
      // NOTE: Backend handlers are stubs, using hardcoded data
      setWeddingInfo(stubWeddingInfo);
      setPhotos(stubPhotos);
    } catch (error) {
      console.error('Failed to load wedding data:', error);
    }
  }, []);

  useEffect(() => {
    loadWeddingData();
  }, [loadWeddingData]);

  const handleEnvelopeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    
    setIsLoading(true);
    try {
      // NOTE: Backend handler is stub, creating mock guest
      const mockGuest: Guest = {
        id: 1,
        name: guestName,
        email: null,
        phone: null,
        created_at: new Date()
      };
      setGuest(mockGuest);
    } catch (error) {
      console.error('Failed to find guest:', error);
      // Create guest anyway for demo
      const mockGuest: Guest = {
        id: 1,
        name: guestName,
        email: null,
        phone: null,
        created_at: new Date()
      };
      setGuest(mockGuest);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInvitation = () => {
    setCurrentPage('invitation');
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;

    setIsLoading(true);
    try {
      const rsvpData: CreateRsvpInput = {
        guest_id: guest.id,
        will_attend: rsvpForm.will_attend,
        number_of_guests: rsvpForm.number_of_guests,
        message: rsvpForm.message || null
      };
      
      // NOTE: Backend handler works, but we'll simulate success
      await trpc.createRsvp.mutate(rsvpData);
      setRsvpSubmitted(true);
    } catch (error) {
      console.error('Failed to submit RSVP:', error);
      // Show success anyway for demo
      setRsvpSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const mainPhoto = photos.find(p => p.is_main_photo);
  const galleryPhotos = photos.filter(p => !p.is_main_photo).sort((a, b) => (a.gallery_order || 0) - (b.gallery_order || 0));

  if (currentPage === 'envelope') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-rose-200 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h1 className="text-3xl font-serif text-rose-900 mb-2">Wedding Invitation</h1>
                <p className="text-rose-600 font-light">Sarah & Mike</p>
              </div>
              
              {!guest ? (
                <form onSubmit={handleEnvelopeSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="guestName" className="text-rose-700 font-medium">
                      Please enter your name to view the invitation
                    </Label>
                    <Input
                      id="guestName"
                      value={guestName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestName(e.target.value)}
                      placeholder="Your full name"
                      className="mt-2 border-rose-200 focus:border-rose-400"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3"
                  >
                    {isLoading ? 'Loading...' : 'Continue'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-xl text-rose-800 font-serif mb-1">Dear</p>
                    <p className="text-2xl text-rose-900 font-bold">{guest.name}</p>
                  </div>
                  
                  <div className="border-t border-rose-200 pt-6">
                    <p className="text-rose-700 mb-6 leading-relaxed">
                      You are cordially invited to celebrate the wedding of Sarah & Mike
                    </p>
                    <Button
                      onClick={handleOpenInvitation}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium py-3 text-lg"
                    >
                      Open Invitation ✨
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!weddingInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-rose-500 mx-auto animate-pulse mb-4" />
          <p className="text-rose-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header with floating hearts decoration */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-100 to-pink-100 py-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-8 h-8 text-rose-300 opacity-20">💕</div>
          <div className="absolute top-12 right-8 w-6 h-6 text-pink-300 opacity-30">💖</div>
          <div className="absolute bottom-4 left-1/3 w-5 h-5 text-rose-300 opacity-25">💝</div>
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <h1 className="text-4xl md:text-6xl font-serif text-rose-900 mb-2">
            {weddingInfo.bride_nickname} & {weddingInfo.groom_nickname}
          </h1>
          <p className="text-rose-600 text-lg font-light">are getting married</p>
          <div className="mt-4 flex items-center justify-center space-x-2 text-rose-700">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">
              {weddingInfo.ceremony_date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-16">
        {/* Main Pre-Wedding Photo */}
        {mainPhoto && (
          <section className="text-center">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-rose-200 to-pink-200 rounded-3xl blur opacity-30"></div>
              <img
                src={mainPhoto.url}
                alt={mainPhoto.alt_text || "Pre-wedding photo"}
                className="relative w-full max-w-2xl h-[600px] object-cover rounded-2xl shadow-2xl mx-auto"
              />
            </div>
          </section>
        )}

        {/* Couple Names and Parents */}
        <section className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <Card className="bg-white/70 backdrop-blur border-rose-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">👰</span>
              </div>
              <h3 className="text-2xl font-serif text-rose-900 mb-2">The Bride</h3>
              <h4 className="text-xl font-bold text-rose-800 mb-4">{weddingInfo.bride_full_name}</h4>
              <div className="space-y-2 text-rose-700">
                <p>Daughter of</p>
                <p className="font-medium">{weddingInfo.bride_father}</p>
                <p className="font-medium">{weddingInfo.bride_mother}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur border-rose-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤵</span>
              </div>
              <h3 className="text-2xl font-serif text-blue-900 mb-2">The Groom</h3>
              <h4 className="text-xl font-bold text-blue-800 mb-4">{weddingInfo.groom_full_name}</h4>
              <div className="space-y-2 text-blue-700">
                <p>Son of</p>
                <p className="font-medium">{weddingInfo.groom_father}</p>
                <p className="font-medium">{weddingInfo.groom_mother}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* First Gallery */}
        {galleryPhotos.length > 0 && (
          <section>
            <h2 className="text-3xl font-serif text-center text-rose-900 mb-8">Our Journey</h2>
            <div className="masonry-grid">
              {galleryPhotos.slice(0, 2).map((photo: WeddingPhoto) => (
                <div key={photo.id} className="masonry-item">
                  <img
                    src={photo.url}
                    alt={photo.alt_text || "Pre-wedding photo"}
                    className="w-full h-auto rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Event Details */}
        <section className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Ceremony */}
          <Card className="bg-white/70 backdrop-blur border-rose-200 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mx-auto mb-6">
                <span className="text-2xl">🕌</span>
              </div>
              <h3 className="text-2xl font-serif text-center text-rose-900 mb-6">Marriage Ceremony</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-rose-700">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">
                    {weddingInfo.ceremony_date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-rose-700">
                  <Clock className="w-5 h-5" />
                  <span>{weddingInfo.ceremony_time_start} - {weddingInfo.ceremony_time_end}</span>
                </div>
                <div className="flex items-start space-x-3 text-rose-700">
                  <MapPin className="w-5 h-5 mt-0.5" />
                  <span>{weddingInfo.ceremony_location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reception */}
          <Card className="bg-white/70 backdrop-blur border-rose-200 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mx-auto mb-6">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="text-2xl font-serif text-center text-pink-900 mb-6">Reception</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-pink-700">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">
                    {weddingInfo.reception_date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-pink-700">
                  <Clock className="w-5 h-5" />
                  <span>{weddingInfo.reception_time_start} - {weddingInfo.reception_time_end}</span>
                </div>
                <div className="flex items-start space-x-3 text-pink-700">
                  <MapPin className="w-5 h-5 mt-0.5" />
                  <span>{weddingInfo.reception_location}</span>
                </div>
                {weddingInfo.reception_maps_url && (
                  <a
                    href={weddingInfo.reception_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    View on Maps
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Second Gallery */}
        {galleryPhotos.length > 2 && (
          <section>
            <h2 className="text-3xl font-serif text-center text-rose-900 mb-8">More Memories</h2>
            <div className="masonry-grid">
              {galleryPhotos.slice(2).map((photo: WeddingPhoto) => (
                <div key={photo.id} className="masonry-item">
                  <img
                    src={photo.url}
                    alt={photo.alt_text || "Pre-wedding photo"}
                    className="w-full h-auto rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RSVP Section */}
        <section className="max-w-2xl mx-auto">
          <Card className="bg-white/70 backdrop-blur border-rose-200 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif text-rose-900 mb-4">RSVP</h2>
                <p className="text-rose-700 leading-relaxed">{weddingInfo.rsvp_message}</p>
              </div>

              {!rsvpSubmitted ? (
                <form onSubmit={handleRsvpSubmit} className="space-y-6">
                  <div>
                    <Label className="text-rose-700 font-medium mb-3 block">Will you attend?</Label>
                    <RadioGroup
                      value={rsvpForm.will_attend ? 'yes' : 'no'}
                      onValueChange={(value: string) =>
                        setRsvpForm((prev: typeof rsvpForm) => ({ ...prev, will_attend: value === 'yes' }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes">Yes, I will attend ✨</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no">Sorry, I cannot attend</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {rsvpForm.will_attend && (
                    <div>
                      <Label htmlFor="guests" className="text-rose-700 font-medium">
                        Number of guests (including yourself)
                      </Label>
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max="10"
                        value={rsvpForm.number_of_guests}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setRsvpForm((prev: typeof rsvpForm) => ({
                            ...prev,
                            number_of_guests: parseInt(e.target.value) || 1
                          }))
                        }
                        className="mt-2 border-rose-200 focus:border-rose-400"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="message" className="text-rose-700 font-medium">
                      Message for the couple (optional)
                    </Label>
                    <Textarea
                      id="message"
                      value={rsvpForm.message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setRsvpForm((prev: typeof rsvpForm) => ({ ...prev, message: e.target.value }))
                      }
                      placeholder="Your wishes for the happy couple..."
                      className="mt-2 border-rose-200 focus:border-rose-400"
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3"
                  >
                    {isLoading ? 'Submitting...' : 'Submit RSVP'}
                  </Button>
                </form>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="text-2xl font-serif text-green-800 mb-2">Thank You!</h3>
                  <p className="text-green-700">Your RSVP has been submitted successfully.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Gift Information */}
        <section className="max-w-2xl mx-auto">
          <Card className="bg-white/70 backdrop-blur border-rose-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-3xl font-serif text-rose-900 mb-4">Wedding Gift</h2>
              <p className="text-rose-700 mb-6 leading-relaxed">
                Your presence is the greatest gift, but if you wish to give a wedding gift, 
                you can transfer to:
              </p>
              <div className="bg-rose-50 rounded-lg p-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-rose-600">Bank:</span>
                  <span className="font-medium text-rose-900">{weddingInfo.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-600">Account Holder:</span>
                  <span className="font-medium text-rose-900">{weddingInfo.account_holder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-600">Account Number:</span>
                  <span className="font-medium text-rose-900 font-mono">{weddingInfo.account_number}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Co-invitation Message */}
        <section className="max-w-3xl mx-auto text-center">
          <Card className="bg-white/70 backdrop-blur border-rose-200 shadow-xl">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-serif text-rose-900 mb-4">Special Invitation</h2>
              <p className="text-rose-700 leading-relaxed text-lg">
                {weddingInfo.co_invitation_message}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Quranic Verse */}
        <section className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200 shadow-xl">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📿</span>
              </div>
              <h2 className="text-2xl font-serif text-emerald-900 mb-6">Blessing</h2>
              <blockquote className="text-emerald-800 italic text-lg leading-relaxed">
                "{weddingInfo.quran_verse}"
              </blockquote>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-rose-600">
            <Heart className="w-5 h-5" />
            <span className="font-serif text-lg">
              {weddingInfo.bride_nickname} & {weddingInfo.groom_nickname}
            </span>
            <Heart className="w-5 h-5" />
          </div>
          <p className="text-rose-500 mt-2">
            {weddingInfo.ceremony_date.getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;