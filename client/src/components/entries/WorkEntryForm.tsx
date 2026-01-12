"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { entriesApi } from '@/lib/api';
import type { WorkEntryInput } from '@/types';
import { Clock, Briefcase, GraduationCap, Heart, Users, Target, Zap, Save, AlertCircle } from 'lucide-react';

interface WorkEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const categories = [
  { value: 'project', label: 'Project', icon: Briefcase, color: 'bg-blue-100 text-blue-800' },
  { value: 'study', label: 'Study', icon: GraduationCap, color: 'bg-green-100 text-green-800' },
  { value: 'personal', label: 'Personal', icon: Heart, color: 'bg-purple-100 text-purple-800' },
  { value: 'client', label: 'Client', icon: Users, color: 'bg-orange-100 text-orange-800' },
];

const outcomes = [
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-800' },
  { value: 'partial', label: 'Partial', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'stuck', label: 'Stuck', color: 'bg-red-100 text-red-800' },
];

export function WorkEntryForm({ open, onOpenChange, onSuccess }: WorkEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<WorkEntryInput>({
    title: '',
    description: '',
    category: 'project',
    timeSpent: null,
    outcome: 'done',
    blockers: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await entriesApi.create(formData);
      setFormData({
        title: '',
        description: '',
        category: 'project',
        timeSpent: null,
        outcome: 'done',
        blockers: null,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save work entry');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);
  const selectedOutcome = outcomes.find(outcome => outcome.value === formData.outcome);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Capture Work Memory
          </DialogTitle>
          <DialogDescription>
            Document this moment of work to build your productivity insights.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          {/* Title Section */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">Title *</Label>
            <Input
              id="title"
              placeholder="What did you work on?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-11"
            />
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what you accomplished, decisions made, challenges faced, and outcomes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Category and Outcome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory && (
                <Badge className={selectedCategory.color}>
                  <selectedCategory.icon className="h-3 w-3 mr-1" />
                  {selectedCategory.label}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Outcome</Label>
              <Select
                value={formData.outcome}
                onValueChange={(value: any) => setFormData({ ...formData, outcome: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  {outcomes.map((outcome) => (
                    <SelectItem key={outcome.value} value={outcome.value}>
                      {outcome.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedOutcome && (
                <Badge className={selectedOutcome.color}>
                  {selectedOutcome.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Time Spent */}
          <div className="space-y-2">
            <Label htmlFor="timeSpent" className="text-base font-medium">
              Time Spent (minutes)
              <span className="text-sm font-normal text-muted-foreground ml-2">Optional</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="timeSpent"
                type="number"
                placeholder="e.g., 60"
                value={formData.timeSpent || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  timeSpent: e.target.value ? parseInt(e.target.value) : null 
                })}
                className="h-11"
              />
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Blockers */}
          <div className="space-y-2">
            <Label htmlFor="blockers" className="text-base font-medium">
              Blockers & Challenges
              <span className="text-sm font-normal text-muted-foreground ml-2">Optional</span>
            </Label>
            <Textarea
              id="blockers"
              placeholder="Any blockers, challenges, or obstacles you encountered?"
              value={formData.blockers || ''}
              onChange={(e) => setFormData({ ...formData, blockers: e.target.value || null })}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Memory
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Quick Capture Component
export function QuickCapture({ onSave }: { onSave: (entry: Omit<WorkEntryInput, 'id'>) => void }) {
  const [formData, setFormData] = useState<Omit<WorkEntryInput, 'id'>>({
    title: '',
    description: '',
    category: 'project',
    timeSpent: null,
    outcome: 'done',
    blockers: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ ...formData });
      setFormData({
        title: '',
        description: '',
        category: 'project',
        timeSpent: null,
        outcome: 'done',
        blockers: null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Quick capture: What did you work on?"
            className="flex-1"
            disabled={isSubmitting}
          />
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// Advanced Capture Component with Energy Tracking
export function AdvancedCapture({ onSave }: { onSave: (entry: any) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'project',
    timeSpent: 1,
    energyCost: 3,
    outcome: 'done',
    blockers: null,
    contextNotes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.timeSpent <= 0) {
      newErrors.timeSpent = 'Time spent must be greater than 0';
    }

    if (formData.energyCost < 1 || formData.energyCost > 10) {
      newErrors.energyCost = 'Energy cost must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({ ...formData, createdAt: new Date() });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Advanced Work Capture
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="What did you work on?"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe what you accomplished, challenges faced, and outcomes..."
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* Time and Energy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeSpent">Time Spent (hours) *</Label>
            <Input
              id="timeSpent"
              type="number"
              step="0.5"
              min="0.5"
              value={formData.timeSpent}
              onChange={(e) => handleInputChange('timeSpent', parseFloat(e.target.value) || 0)}
              className={errors.timeSpent ? 'border-red-500' : ''}
            />
            {errors.timeSpent && <p className="text-sm text-red-500">{errors.timeSpent}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="energyCost">Energy Cost (1-10) *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="energyCost"
                type="number"
                min="1"
                max="10"
                value={formData.energyCost}
                onChange={(e) => handleInputChange('energyCost', parseInt(e.target.value) || 1)}
                className={errors.energyCost ? 'border-red-500' : ''}
              />
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
            {errors.energyCost && <p className="text-sm text-red-500">{errors.energyCost}</p>}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleInputChange('energyCost', level)}
                  className={`w-6 h-6 text-xs rounded ${
                    level <= formData.energyCost
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Advanced Entry
          </Button>
        </div>
      </form>
    </Card>
  );
}
