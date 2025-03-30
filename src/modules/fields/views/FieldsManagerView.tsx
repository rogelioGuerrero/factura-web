import React from 'react';
import { FieldsManager } from '../components/FieldsManager';
import { MainLayout } from '@/modules/layout/MainLayout';

export const FieldsManagerView: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <FieldsManager />
      </div>
    </MainLayout>
  );
};
