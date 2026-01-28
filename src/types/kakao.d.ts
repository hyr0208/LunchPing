// 카카오맵 SDK 타입 정의
declare namespace kakao {
  namespace maps {
    function load(callback: () => void): void;
    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      getCenter(): LatLng;
      setLevel(level: number): void;
      getLevel(): number;
      panTo(latlng: LatLng): void;
      setBounds(bounds: LatLngBounds): void;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng;
      setPosition(position: LatLng): void;
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions);
      setMap(map: Map | null): void;
      setContent(content: string | HTMLElement): void;
      setPosition(position: LatLng): void;
    }

    class LatLngBounds {
      constructor();
      extend(latlng: LatLng): void;
    }

    interface MapOptions {
      center: LatLng;
      level: number;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      image?: MarkerImage;
    }

    interface CustomOverlayOptions {
      position: LatLng;
      content: string | HTMLElement;
      yAnchor?: number;
      xAnchor?: number;
      zIndex?: number;
    }

    class MarkerImage {
      constructor(src: string, size: Size, options?: MarkerImageOptions);
    }

    class Size {
      constructor(width: number, height: number);
    }

    interface MarkerImageOptions {
      offset?: Point;
    }

    class Point {
      constructor(x: number, y: number);
    }

    namespace event {
      function addListener(
        target: Marker | Map,
        type: string,
        callback: () => void,
      ): void;
      function removeListener(
        target: Marker | Map,
        type: string,
        callback: () => void,
      ): void;
    }
  }
}

interface Window {
  kakao: typeof kakao;
}
