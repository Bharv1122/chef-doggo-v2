import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { DogProfileForm } from '../../components/dog/DogProfileForm';
import { useDogProfiles } from '../../hooks/useDogProfiles';

export default function NewProfilePage() {
  const navigate = useNavigate();
  const { createProfile } = useDogProfiles();

  return (
    <>
      <Header title="Add Your Dog" backTo="/profiles" backLabel="My Dogs" />
      <PageWrapper>
        <DogProfileForm
          onSave={async data => {
            await createProfile(data);
            navigate('/profiles');
          }}
          onCancel={() => navigate('/profiles')}
        />
      </PageWrapper>
    </>
  );
}
