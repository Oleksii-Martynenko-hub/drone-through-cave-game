import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { WithoutNull } from 'src/types/common';

type Orientation = WithoutNull<Omit<DeviceMotionEventAcceleration, 'z'>> | null;

export const useDeviceOrientation = (
  setIsShowModal: Dispatch<SetStateAction<boolean>>,
) => {
  const orientationOrigin = useRef<Orientation>(null);
  const [orientation, setOrientation] = useState<Orientation>(null);

  useEffect(() => {
    handleDeviceMotionRequest(true);

    const deviceOrientationEventHandler = (event: DeviceOrientationEvent) => {
      const x = event.beta ?? 0;
      const y = event.gamma ?? 0;

      if (!orientationOrigin.current) {
        orientationOrigin.current = { x, y };

        return;
      }

      setOrientation({
        x: x - orientationOrigin.current.x,
        y: y - orientationOrigin.current.y,
      });
    };

    window.addEventListener(
      'deviceorientation',
      deviceOrientationEventHandler,
      true,
    );
  }, []);

  const handleDeviceMotionRequest = async (checkPermission = false) => {
    type DOEvent = {
      requestPermission: () => Promise<PermissionState>;
    };

    try {
      if (typeof (DeviceOrientationEvent as unknown as DOEvent) !== undefined) {
        if (
          typeof (DeviceOrientationEvent as unknown as DOEvent)
            .requestPermission === 'function'
        ) {
          const permission = await (
            DeviceOrientationEvent as unknown as DOEvent
          ).requestPermission();

          if (permission == 'granted') {
            return;
          }

          if (checkPermission) setIsShowModal(true);
        }
      }
    } catch (err) {
      if (checkPermission) setIsShowModal(true);
    }
  };

  return {
    orientation,
    handleDeviceMotionRequest,
  };
};
