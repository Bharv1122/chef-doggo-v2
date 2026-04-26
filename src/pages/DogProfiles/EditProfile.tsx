import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { DogProfileForm } from '../../components/dog/DogProfileForm';
import { useDogProfiles } from '../../hooks/useDogProfiles';

export default function EditProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProfile, updateProfile } = useDogProfiles();
  const profile = getProfile(id!);

  if (!profile) {
    return (
      <>
        <Header title="Profile Not Found" backTo="/profiles" />
        <PageWrapper>
          <p className="text-[#78716C] text-sm">This dog profile could not be found.</p>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <Header title={`Edit ${profile.name}`} backTo="/profiles" backLabel="My Dogs" />
      <PageWrapper>
        <DogProfileForm
          initial={profile}
          onSave={async data => {
            await updateProfile(profile.id, data);
            navigate('/profiles');
          }}
          onCancel={() => navigate('/profiles')}
        />
      </PageWrapper>
    </>
  );
}
