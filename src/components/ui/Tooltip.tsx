import React from 'react';
import * as T from '@radix-ui/react-tooltip';


export const Tooltip = ({ content, children }: { content: string; children: React.ReactNode }) => (
  <T.Provider delayDuration={300}>
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content className="z-50 px-2 py-1 text-xs bg-text text-bg rounded-md shadow" sideOffset={4}>
          {content}
          <T.Arrow className="fill-text" />
        </T.Content>
      </T.Portal>
    </T.Root>
  </T.Provider>
);