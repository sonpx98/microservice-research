// import FlashCardFav from 'flash-card-fav/app';
// import CvGenerator from 'cv-generator/app';
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2Icon } from 'lucide-react';

const FlashCardFav = React.lazy(() => import('flash-card-fav/app'));
const CvGenerator = React.lazy(() => import('cv-generator/app'));

function App() {
  return (
    <React.Suspense fallback={<Loader2Icon className='animate-spin' />}>
      <Tabs defaultValue='flash-card-fav'>
        <div className='flex flex-col items-center h-25 w-full justify-center fixed top-0 z-99'>
          <TabsList>
            <TabsTrigger value='flash-card-fav'>Flash Card Fav</TabsTrigger>
            <TabsTrigger value='cv-generator'>Cv Generator</TabsTrigger>
          </TabsList>
        </div>
        <div className='flex flex-col items-center h-screen w-full mt-25 bg-red-50'>
          <TabsContent value='flash-card-fav'>
            <React.Suspense fallback={<Loader2Icon className='animate-spin' />}>
              <FlashCardFav />
            </React.Suspense>
          </TabsContent>
          <TabsContent value='cv-generator'>
            <React.Suspense fallback={<Loader2Icon className='animate-spin' />}>
              <CvGenerator />
            </React.Suspense>
          </TabsContent>
        </div>
      </Tabs>
    </React.Suspense>
  );
}

export default App;
