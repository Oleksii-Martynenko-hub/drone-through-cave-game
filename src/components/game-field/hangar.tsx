type Props = {
  x: number;
  y: number;
};

const Hangar = ({ x, y }: Props) => {
  return (
    <svg
      x={x}
      y={y}
      width={40}
      height={40}
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 390.21 390.21"
      fill="#000000"
      stroke="#000000"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {' '}
        <path
          fill="#e2be53"
          d="M263.37,64.226h-65.551c33.616,22.756,55.855,61.22,55.855,105.115V325.98l114.877,-70V169.341 C368.549,111.354,321.358,64.226,263.37,64.226z"
        ></path>{' '}
        <rect
          x="99.685"
          y="222.998"
          fill="#FFFFFF"
          width="53.657"
          height="102.4"
        ></rect>{' '}
        <path
          fill="#81b7d9"
          d="M231.952,169.341v156.057h-56.889V212.137c0-5.947-4.848-10.861-10.861-10.861H88.889 c-5.947,0-10.861,4.848-10.861,10.861v113.261H21.657V169.341c0-57.988,47.127-105.115,105.115-105.115 C184.824,64.226,231.952,111.354,231.952,169.341z"
        ></path>{' '}
        <g>
          {' '}
          <path
            fill="#2e557a"
            d="M263.37,42.505H126.836C56.954,42.505,0,99.394,0,169.341V336.84 c0,5.947,4.848,10.861,10.861,10.861h 243.139 c 5.947 0 9 -2.701 14 -4.701 L 372 279 C 379 274 389 268 392 255 V 174  C390.206,99.394,333.317,42.505,263.37,42.505z M231.952,325.398h-56.889V212.137c0-5.947-4.848-10.861-10.861-10.861H88.889 c-5.947,0-10.861,4.848-10.861,10.861v113.261H21.657V169.341c0-57.988,47.127-105.115,105.115-105.115 s105.18,47.127,105.18,105.115V325.398z M153.341,325.398H99.685v-102.4h53.657V325.398z M368.549,255.398L253.608,325.398V169.341 c0-43.895-22.238-82.36-55.855-105.115h66.133c57.988,0,105.115,47.127,105.115,105.115v86.057z"
          ></path>{' '}
          <path
            fill="#2e557a"
            d="M97.034,149.818h60.186c5.947,0,10.861-4.848,10.861-10.861s-4.848-10.861-10.861-10.861H97.034 c-5.947,0-10.861,4.848-10.861,10.861S90.505,149.818,97.034,149.818z"
          ></path>{' '}
        </g>{' '}
      </g>
    </svg>
  );
};

export default Hangar;
