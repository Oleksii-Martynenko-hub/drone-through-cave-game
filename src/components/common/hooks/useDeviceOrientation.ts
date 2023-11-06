import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { WithoutNull } from 'src/types/common';

export const useDeviceOrientation = (
  setIsShowModal: Dispatch<SetStateAction<boolean>>,
) => {
  const [orientationOrigin, setOrientationOrigin] =
    useState<WithoutNull<DeviceMotionEventAcceleration> | null>(null);
  const [orientation, setOrientation] =
    useState<WithoutNull<DeviceMotionEventAcceleration> | null>(null);

  useEffect(() => {
    handleDeviceMotionRequest(true);

    const deviceOrientationEventHandler = (event: DeviceOrientationEvent) => {
      setOrientation({
        z: event.alpha ?? 0,
        x: event.beta ?? 0,
        y: event.gamma ?? 0,
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
