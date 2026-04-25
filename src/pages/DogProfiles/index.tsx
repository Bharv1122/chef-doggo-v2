import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, PawPrint } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { DogProfileCard } from '../../components/dog/DogProfileCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useDogProfiles } from '../../hooks/useDogProfiles';

export default function DogProfilesPage() {
  const navigate = useNavigate();
  const { profiles, activeProfileId, setActiveProfileId, deleteProfile } = useDogProfiles();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <>
      <Header
        title="My Dogs"
        actions={
          <Button size="sm" icon={<Plus size={16} />} onClick={() => navigate('/profiles/new')}>
            Add Dog
          </Button>
        }
      />
      <PageWrapper>
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <PawPrint size={32} className="text-[#F97316]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#1C1917] text-lg">No dogs yet</h2>
              <p className="text-[#78716C] text-sm mt-1">Add your first dog profile to get started</p>
            </div>
            <Button icon={<Plus size={16} />} onClick={() => navigate('/profiles/new')}>Add Your Dog</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles.map(profile => (
              <DogProfileCard
                key={profile.id}
                profile={profile}
                isActive={profile.id === activeProfileId}
                onSetActive={() => setActiveProfileId(profile.id)}
                onDelete={() => setConfirmDeleteId(profile.id)}
              />
            ))}
          </div>
        )}
      </PageWrapper>

      <Modal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete Profile"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={() => { deleteProfile(confirmDeleteId!); setConfirmDeleteId(null); }}>Delete</Button>
          </div>
        }
      >
        <p className="text-sm text-[#78716C]">
          Are you sure you want to delete this profile? This will also remove all saved recipes for this dog. This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
