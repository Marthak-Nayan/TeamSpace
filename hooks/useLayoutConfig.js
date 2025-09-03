import { useMemo } from 'react';

export const useLayoutConfig = (participantCount) => {
  return useMemo(() => {
    if (participantCount === 1) {
      return {
        containerStyle: {
          display: "flex",
          width: "100vw",
          height: "90vh",
          padding: "8px",
          paddingBottom: "8px"
        },
        showSidebar: false,
        mainParticipantIndex: 0,
        layoutType: 'single'
      };
    } else if (participantCount === 2) {
      return {
        containerStyle: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          width: "100vw",
          height: "90vh",
          gap: "8px",
          padding: "8px",
          paddingBottom: "8px"
        },
        showSidebar: false,
        mainParticipantIndex: null,
        layoutType: 'dual'
      };
    } else if (participantCount <= 4) {
      return {
        containerStyle: {
          display: "grid",
          gridTemplateColumns: "70% 30%",
          width: "100vw",
          height: "90vh",
          gap: "8px",
          padding: "8px",
          paddingBottom: "8px"
        },
        showSidebar: true,
        mainParticipantIndex: 0,
        sidebarRows: `repeat(auto-fit, minmax(120px, 1fr))`,
        layoutType: 'main-sidebar'
      };
    } else if (participantCount <= 6) {
      return {
        containerStyle: {
          display: "grid",
          gridTemplateColumns: "60% 40%",
          width: "100vw",
          height: "100vh",
          gap: "8px",
          padding: "8px",
          paddingBottom: "80px"
        },
        showSidebar: true,
        mainParticipantIndex: 0,
        sidebarRows: `repeat(auto-fit, minmax(100px, 1fr))`,
        layoutType: 'main-sidebar'
      };
    } else {
      return {
        containerStyle: {
          display: "grid",
          gridTemplateColumns: "50% 50%",
          width: "100vw",
          height: "100vh",
          gap: "8px",
          padding: "8px",
          paddingBottom: "80px"
        },
        showSidebar: true,
        mainParticipantIndex: 0,
        sidebarRows: `repeat(auto-fit, minmax(80px, 1fr))`,
        layoutType: 'main-sidebar'
      };
    }
  }, [participantCount]);
};