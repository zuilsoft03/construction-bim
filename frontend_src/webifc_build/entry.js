// Single IIFE bundle for the web-ifc IFC engine:
// exposes window.IFCEngine = { THREE, WebIFC, IFCLoader, IfcAPI }
import * as THREE from 'three';
import * as WebIFC from 'web-ifc';
import { IFCLoader } from 'web-ifc-three';

window.IFCEngine = { THREE, WebIFC, IFCLoader };
