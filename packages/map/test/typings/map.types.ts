import '../../vaadin-map.js';
import OpenLayersMap from 'ol/Map.js';

const assertType = <TExpected>(actual: TExpected) => actual;

const map = document.createElement('vaadin-map');
assertType<OpenLayersMap>(map.configuration);
