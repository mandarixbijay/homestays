'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Info, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Step3FormData } from '@/app/list-your-property/owner-registration/types';

export interface Facility {
  id: number | string;
  name: string;
}



interface Props {
  sessionId: string;
  onDefaultFacilitiesLoaded: (facilities: Facility[]) => void;
  onSubmissionError?: (error: string) => void;
  setHasExistingData: (hasData: boolean) => void; // New prop to communicate hasExistingData
}

export function Step3Facilities({ sessionId, onDefaultFacilitiesLoaded, onSubmissionError, setHasExistingData }: Props) {
  const { register, watch, setValue, trigger, formState: { errors } } = useFormContext<Step3FormData>();
  const { toast } = useToast();

  const [customInput, setCustomInput] = useState('');
  const [defaultFacilities, setDefaultFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customFacilityIds, setCustomFacilityIds] = useState<{ [key: string]: string }>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const selectedFacilities = watch('selectedFacilities') || [];
  const customFacilities = watch('customFacilities') || [];
  const formCustomFacilityIds = watch('customFacilityIds') || {};

  const fetchDefaultFacilities = useCallback(async () => {
    try {
      const res = await fetch('/api/onboarding/step3/facilities', {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`Failed to load default facilities (Status: ${res.status})`);
      const data: Facility[] = await res.json();
      setDefaultFacilities(data);
      onDefaultFacilitiesLoaded(data);
      return data;
    } catch (error) {
      console.error("Error fetching default facilities:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load default facilities. Please refresh or try again.',
      });
      return [];
    }
  }, [toast, onDefaultFacilitiesLoaded]);

  const fetchStep3Data = useCallback(async (facilities: Facility[]) => {
    try {
      const res = await fetch(`/api/onboarding/step3/${sessionId}`, {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (res.status === 404) {
        setValue('selectedFacilities', [], { shouldValidate: true });
        setValue('customFacilities', [], { shouldValidate: true });
        setValue('customFacilityIds', {}, { shouldValidate: false });
        setCustomFacilityIds({});
        setHasExistingData(false);
        return;
      }

      const data = await res.json();
      console.log("Fetched Step 3 data:", JSON.stringify(data, null, 2));
      const defaultSelected = data.facilityIds || [];
      const customIds = (data.customFacilities || []).reduce((acc: { [key: string]: string }, cf: { name: string }) => ({
        ...acc,
        [cf.name]: uuidv4(),
      }), {} as { [key: string]: string });
      const customSelected = Object.values(customIds);
      setValue('selectedFacilities', [...defaultSelected, ...customSelected], { shouldValidate: true });
      setValue('customFacilities', data.customFacilities || [], { shouldValidate: true });
      setValue('customFacilityIds', customIds, { shouldValidate: false });
      setCustomFacilityIds(customIds);
      setHasExistingData(true);
    } catch (error) {
      console.error("Error fetching Step 3 data:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load saved facilities.',
      });
      setHasExistingData(false);
    }
  }, [sessionId, setValue, toast, setHasExistingData]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const facilities = await fetchDefaultFacilities();
      if (isMounted) {
        await fetchStep3Data(facilities);
        setIsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [fetchDefaultFacilities, fetchStep3Data]);

  const handleAddCustom = () => {
    const name = customInput.trim();
    if (!name) return;

    const exists = [...defaultFacilities.map(f => f.name.toLowerCase()), ...customFacilities.map(f => f.name.toLowerCase())].includes(name.toLowerCase());

    if (exists) {
      toast({ variant: 'destructive', title: 'Duplicate', description: 'This facility already exists.' });
      return;
    }

    if (customFacilities.length >= 10) {
      toast({ variant: 'destructive', title: 'Limit Reached', description: 'Maximum 10 custom facilities allowed.' });
      return;
    }

    const newId = uuidv4();
    const updatedCustom = [...customFacilities, { name }];
    const updatedSelected = [...selectedFacilities, newId];

    setValue('customFacilities', updatedCustom, { shouldValidate: true });
    setValue('selectedFacilities', updatedSelected, { shouldValidate: true });
    setValue('customFacilityIds', { ...customFacilityIds, [name]: newId }, { shouldValidate: false });
    setCustomFacilityIds(prev => ({ ...prev, [name]: newId }));
    setCustomInput('');
    trigger('selectedFacilities');
  };

  const handleCheckbox = (facility: Facility, checked: boolean) => {
    const updated = checked
      ? [...selectedFacilities, facility.id]
      : selectedFacilities.filter(f => f !== facility.id);
    setValue('selectedFacilities', updated, { shouldValidate: true });
    trigger('selectedFacilities');
  };

  const handleRemoveCustom = (name: string) => {
    const updatedCustom = customFacilities.filter(f => f.name !== name);
    const customId = customFacilityIds[name];
    const updatedSelected = selectedFacilities.filter(id => id !== customId);
    setValue('customFacilities', updatedCustom, { shouldValidate: true });
    setValue('selectedFacilities', updatedSelected, { shouldValidate: true });
    const { [name]: _removed, ...restIds } = customFacilityIds;
    setValue('customFacilityIds', restIds, { shouldValidate: false });
    setCustomFacilityIds(prev => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });
    trigger('selectedFacilities');
  };

  useEffect(() => {
    const handleSubmissionError = (event: CustomEvent<string>) => {
      setSubmissionError(event.detail);
      if (onSubmissionError) onSubmissionError(event.detail);
    };
    const element = document.querySelector('#step3-facilities');
    if (element) {
      element.addEventListener('submissionError', handleSubmissionError as EventListener);
    }
    return () => {
      if (element) {
        element.removeEventListener('submissionError', handleSubmissionError as EventListener);
      }
    };
  }, [onSubmissionError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading facilities...</span>
      </div>
    );
  }

  const allFacilities = [
    ...defaultFacilities,
    ...customFacilities.map(f => ({ id: customFacilityIds[f.name] || uuidv4(), name: f.name } as Facility)),
  ];

  return (
    <div id="step3-facilities" className="space-y-6">
      {submissionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{submissionError}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <Label className="text-lg font-semibold">Select Facilities</Label>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
          <Info className="h-4 w-4" />
          Select at least one facility. Add custom facilities below (max 10).
        </p>
        {errors.selectedFacilities && (
          <p className="text-sm text-red-600 mt-2">{errors.selectedFacilities.message}</p>
        )}
        {errors.customFacilities && (
          <p className="text-sm text-red-600 mt-2">{errors.customFacilities.message}</p>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
          {allFacilities.map((facility) => (
            <div key={facility.id} className="flex items-center gap-2 group">
              <Checkbox
                id={facility.name}
                checked={selectedFacilities.includes(facility.id)}
                onCheckedChange={checked => handleCheckbox(facility, !!checked)}
                className={errors.selectedFacilities ? 'border-red-500' : ''}
              />
              <Label htmlFor={facility.name} className="cursor-pointer text-sm font-medium">{facility.name}</Label>
              {typeof facility.id === 'string' && (
                <button
                  type="button"
                  onClick={() => handleRemoveCustom(facility.name)}
                  className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 p-1 rounded-full"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <Label htmlFor="custom-facility" className="text-lg font-semibold">Add Custom Facility</Label>
        <div className="flex mt-3 gap-3">
          <Input
            id="custom-facility"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            placeholder="e.g., Gym, Spa"
            className={errors.customFacilities ? 'border-red-500' : ''}
          />
          <Button onClick={handleAddCustom} disabled={!customInput.trim()}>
            Add
          </Button>
        </div>
        {errors.customFacilities && (
          <p className="text-sm text-red-600 mt-2">{errors.customFacilities.message}</p>
        )}
      </div>
    </div>
  );
}