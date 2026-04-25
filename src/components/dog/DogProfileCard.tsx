import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Weight, Activity, Utensils, Edit2, Trash2, Star } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { DogProfile } from '../../types/dog';

interface Props {
  profile: DogProfile;
  isActive?: boolean;
  onSetActive?: () => void;
  onDelete?: () => void;
}

const LIFE_STAGE_LABELS = { puppy: 'Puppy', adult: 'Adult', senior: 'Senior' };
const ACTIVITY_LABELS = { low: 'Low', moderate: 'Moderate', active: 'Active', very_active: 'Very Active' };
const LIFE_STAGE_COLORS: Record<string, 'amber' | 'green' | 'gray'> = {
  puppy: 'amber', adult: 'green', senior: 'gray',
};

export function DogProfileCard({ profile, isActive, onSetActive, onDelete }: Props) {
  const navigate = useNavigate();
  const ageStr = profile.ageYears > 0
    ? `${profile.ageYears}y${profile.ageMonths > 0 ? ` ${profile.ageMonths}mo` : ''}`
    : `${profile.ageMonths}mo`;

  return (
    <Card className={isActive ? 'ring-2 ring-[#F97316]' : ''}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[#1C1917] text-base">{profile.name}</h3>
            {isActive && <Badge variant="orange">Active</Badge>}
            <Badge variant={LIFE_STAGE_COLORS[profile.lifeStage]}>{LIFE_STAGE_LABELS[profile.lifeStage]}</Badge>
          </div>
          <p className="text-sm text-[#78716C] mt-0.5">{profile.breed} · {ageStr}</p>
        </div>
        {!isActive && onSetActive && (
          <Button variant="ghost" size="sm" onClick={onSetActive} className="shrink-0">
            Set Active
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#78716C]">
        <span className="flex items-center gap-1"><Weight size={14} /> {profile.weightLbs} lbs</span>
        <span className="flex items-center gap-1"><Activity size={14} /> {ACTIVITY_LABELS[profile.activityLevel]}</span>
        <span className="flex items-center gap-1"><Utensils size={14} /> {profile.mealsPerDay}x/day</span>
        {profile.pickyEater && <Badge variant="amber">Picky Eater</Badge>}
      </div>

      {profile.allergies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="text-xs text-[#78716C] mr-1">Allergies:</span>
          {profile.allergies.map(a => <Badge key={a} variant="red">{a}</Badge>)}
        </div>
      )}

      {profile.favoriteProteins.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-[#78716C] mr-1 flex items-center gap-1"><Star size={11} />Loves:</span>
          {profile.favoriteProteins.map(p => <Badge key={p} variant="green">{p}</Badge>)}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" size="sm" icon={<Edit2 size={14} />} onClick={() => navigate(`/profiles/${profile.id}/edit`)}>Edit</Button>
        {onDelete && (
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={onDelete} className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto">Delete</Button>
        )}
      </div>
    </Card>
  );
}
