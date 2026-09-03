/**
 * Empirical Adversarial Test Harness in Node.js using Three.js r149
 * 
 * Verifies all formulas, linear algebra transformations, projection matrices,
 * clipping plane equations, and the complete BIMCameraMath class from DOC-OPBIM-05.
 */

const assert = require('assert');
const THREE = require('../frontend_src/webifc_build/node_modules/three/build/three.cjs');
const { MeshBVH, computeBoundsTree, disposeBoundsTree, acceleratedRaycast } = require('../frontend_src/webifc_build/node_modules/three-mesh-bvh/build/index.umd.cjs');

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

console.log('=== Starting Empirical Three.js r149 Mathematical Verification ===');

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
    try {
        fn();
        console.log(`[PASS] ${name}`);
        passCount++;
    } catch (err) {
        console.error(`[FAIL] ${name}`);
        console.error(`       Error: ${err.message}`);
        failCount++;
    }
}

// -----------------------------------------------------------------------------
// Reference Implementation from DOC-OPBIM-05 Section 8.1
// -----------------------------------------------------------------------------
class BIMCameraMath {
    static threeToBcfVector(v) {
        return {
            x: Number(v.x.toFixed(4)),
            y: Number((-v.z).toFixed(4)),
            z: Number(v.y.toFixed(4))
        };
    }

    static bcfToThreeVector(v) {
        return {
            x: Number(v.x),
            y: Number(v.z),
            z: Number(-v.y)
        };
    }

    static verticalToHorizontalFov(fovYDeg, aspect) {
        const radY = (fovYDeg * Math.PI) / 360.0;
        const radX = Math.atan(aspect * Math.tan(radY));
        const fovXDeg = (radX * 360.0) / Math.PI;
        return Number(Math.max(10.0, Math.min(160.0, fovXDeg)).toFixed(2));
    }

    static horizontalToVerticalFov(fovXDeg, aspect) {
        const radX = (fovXDeg * Math.PI) / 360.0;
        const radY = Math.atan((1.0 / aspect) * Math.tan(radX));
        const fovYDeg = (radY * 360.0) / Math.PI;
        return Number(Math.max(15.0, Math.min(120.0, fovYDeg)).toFixed(2));
    }

    static bcfToThreePlane(bcfPlane, THREE_LIB) {
        const normal = new THREE_LIB.Vector3(
            bcfPlane.direction.x,
            bcfPlane.direction.z,
            -bcfPlane.direction.y
        ).normalize();

        const loc = new THREE_LIB.Vector3(
            bcfPlane.location.x,
            bcfPlane.location.z,
            -bcfPlane.location.y
        );

        const constant = -normal.dot(loc);
        return new THREE_LIB.Plane(normal, constant);
    }

    static threeToBcfPlane(plane) {
        const dir = {
            x: Number(plane.normal.x.toFixed(4)),
            y: Number((-plane.normal.z).toFixed(4)),
            z: Number(plane.normal.y.toFixed(4))
        };

        const locPoint = plane.normal.clone().multiplyScalar(-plane.constant);
        const loc = {
            x: Number(locPoint.x.toFixed(4)),
            y: Number((-locPoint.z).toFixed(4)),
            z: Number(locPoint.y.toFixed(4))
        };

        return { location: loc, direction: dir };
    }

    static reconstructTarget(cameraPos, cameraDir, raycaster, sceneMeshes, fallbackDistance = 10.0) {
        raycaster.set(cameraPos, cameraDir);
        const hits = raycaster.intersectObjects(sceneMeshes, false);
        if (hits && hits.length > 0 && hits[0].distance > 0.1) {
            return hits[0].point;
        }
        return cameraPos.clone().add(cameraDir.clone().multiplyScalar(fallbackDistance));
    }
}

// =============================================================================
// TESTS
// =============================================================================

// 1. Basis Transformation Matrix Verification with THREE.Matrix4
runTest('1.1 Basis Matrix 4x4 Transformation with Three.js Matrix4', () => {
    // [T]_{Three -> IFC} = R_x(+pi/2)
    const mForward = new THREE.Matrix4().set(
        1,  0,  0, 0,
        0,  0, -1, 0,
        0,  1,  0, 0,
        0,  0,  0, 1
    );

    // [T]_{IFC -> Three} = R_x(-pi/2)
    const mInverse = new THREE.Matrix4().set(
        1,  0,  0, 0,
        0,  0,  1, 0,
        0, -1,  0, 0,
        0,  0,  0, 1
    );

    // Multiply forward and inverse -> Identity
    const mProd = new THREE.Matrix4().multiplyMatrices(mForward, mInverse);
    const mIdent = new THREE.Matrix4().identity();
    assert.deepStrictEqual(mProd.elements, mIdent.elements, 'mForward * mInverse != Identity');

    // Matrix determinant = +1
    assert.strictEqual(mForward.determinant(), 1.0);
    assert.strictEqual(mInverse.determinant(), 1.0);

    // Test rotation about X by +pi/2 using Three.js makeRotationX
    const mRotX = new THREE.Matrix4().makeRotationX(Math.PI / 2.0);
    for (let i = 0; i < 16; i++) {
        assert(Math.abs(mForward.elements[i] - mRotX.elements[i]) < 1e-15, `Element ${i} mismatch with makeRotationX(+pi/2)`);
    }
});

runTest('1.2 Vector mapping round-trip and isometry', () => {
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        const vThree = new THREE.Vector3(x, y, z);

        const vBcf = BIMCameraMath.threeToBcfVector(vThree);
        const vThreeRec = BIMCameraMath.bcfToThreeVector(vBcf);

        assert(Math.abs(vThree.x - vThreeRec.x) < 1e-3, `X mismatch: ${vThree.x} vs ${vThreeRec.x}`);
        assert(Math.abs(vThree.y - vThreeRec.y) < 1e-3, `Y mismatch: ${vThree.y} vs ${vThreeRec.y}`);
        assert(Math.abs(vThree.z - vThreeRec.z) < 1e-3, `Z mismatch: ${vThree.z} vs ${vThreeRec.z}`);
    }
});

// 2. Perspective FOV Conversion & Three.js Camera Consistency
runTest('2.1 Three.js PerspectiveCamera FOV vs BCF FOV', () => {
    const fovY = 50.0;
    const aspect = 1920 / 1080; // 16:9 = 1.7777778
    const camera = new THREE.PerspectiveCamera(fovY, aspect, 0.1, 1000);
    camera.updateProjectionMatrix();

    // Horizontal FOV
    const fovX = BIMCameraMath.verticalToHorizontalFov(fovY, aspect);
    const recoveredFovY = BIMCameraMath.horizontalToVerticalFov(fovX, aspect);
    assert(Math.abs(fovY - recoveredFovY) < 0.05, `FOV mismatch: ${fovY} vs ${recoveredFovY}`);

    // Frustum width and height from camera projection matrix
    // ProjectionMatrix[0][0] = 1 / (aspect * tan(fovY / 2)) = 1 / tan(fovX / 2)
    // ProjectionMatrix[1][1] = 1 / tan(fovY / 2)
    const p00 = camera.projectionMatrix.elements[0]; // 0,0 in column-major
    const p11 = camera.projectionMatrix.elements[5]; // 1,1 in column-major

    const expectedP11 = 1.0 / Math.tan((fovY * Math.PI) / 360.0);
    const expectedP00 = 1.0 / (aspect * Math.tan((fovY * Math.PI) / 360.0));

    assert(Math.abs(p11 - expectedP11) < 1e-12, `p11 mismatch: ${p11} vs ${expectedP11}`);
    assert(Math.abs(p00 - expectedP00) < 1e-12, `p00 mismatch: ${p00} vs ${expectedP00}`);
    
    // Also check p00 == 1 / tan(fovX / 2)
    const p00FromFovX = 1.0 / Math.tan((fovX * Math.PI) / 360.0);
    assert(Math.abs(p00 - p00FromFovX) < 1e-3, `p00 from FOV_x mismatch: ${p00} vs ${p00FromFovX}`);
});

runTest('2.2 FOV Payload Discrepancy Analysis (Mathematical Proof)', () => {
    // In DOC-OPBIM-05 line 423-430:
    // field_of_view (FOV_x) = 60.0 deg
    // aspect_ratio = 1.7778 (16:9)
    // fov_y is claimed to be 36.87 deg.
    // Let's compute exact fov_y:
    const exactFovY = BIMCameraMath.horizontalToVerticalFov(60.0, 1.7778);
    console.log(`       [Analysis] exact FOV_y for (FOV_x=60.0, aspect=1.7778) is: ${exactFovY} deg`);
    
    // Exact aspect ratio needed for FOV_x=60.0 and FOV_y=36.87:
    const tanHalfX = Math.tan((60.0 * Math.PI) / 360.0); // tan(30 deg) = 1/sqrt(3) = 0.57735
    const tanHalfY = Math.tan((36.87 * Math.PI) / 360.0); // tan(18.435 deg) = 0.33333 = 1/3
    const impliedAspect = tanHalfX / tanHalfY;
    console.log(`       [Analysis] Implied aspect ratio for (FOV_x=60.0, FOV_y=36.87) is: ${impliedAspect.toFixed(5)} (sqrt(3)=${Math.sqrt(3).toFixed(5)})`);
    
    // Confirm exact mathematical consistency
    assert(Math.abs(impliedAspect - Math.sqrt(3)) < 1e-3, 'Implied aspect is sqrt(3)');
});

// 3. Orthographic Camera ViewToWorldScale & Frustum Bounds
runTest('3.1 OrthographicCamera Frustum Bounds and Projection Matrix', () => {
    const S_v2w = 24.0; // ViewToWorldScale
    const aspect = 16.0 / 9.0;
    
    const top = +S_v2w / 2.0;
    const bottom = -S_v2w / 2.0;
    const right = +(S_v2w * aspect) / 2.0;
    const left = -(S_v2w * aspect) / 2.0;
    const near = 0.1;
    const far = 1000.0;

    const orthoCam = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    orthoCam.updateProjectionMatrix();

    // Projection matrix elements in Three.js column-major:
    // [0] = 2 / (right - left) = 2 / (S * A)
    // [5] = 2 / (top - bottom) = 2 / S
    // [10] = -2 / (far - near)
    // [14] = -(far + near) / (far - near)
    const m = orthoCam.projectionMatrix.elements;
    assert.strictEqual(m[0], 2.0 / (S_v2w * aspect));
    assert.strictEqual(m[5], 2.0 / S_v2w);
    assert.strictEqual(m[10], -2.0 / (far - near));
    assert.strictEqual(m[14], -(far + near) / (far - near));

    // Forward extraction from active camera
    const extractedScale = (orthoCam.top - orthoCam.bottom) / orthoCam.zoom;
    assert.strictEqual(extractedScale, S_v2w);
});

// 4. 3D Clipping Planes & THREE.Plane conversion
runTest('4.1 Three.js THREE.Plane <-> BCF ClippingPlane Round-Trip', () => {
    for (let i = 0; i < 5000; i++) {
        const locBcf = {
            x: (Math.random() - 0.5) * 500,
            y: (Math.random() - 0.5) * 500,
            z: (Math.random() - 0.5) * 500
        };
        const rawDir = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ).normalize();
        const dirBcf = { x: rawDir.x, y: rawDir.y, z: rawDir.z };

        const bcfPlane = { location: locBcf, direction: dirBcf };
        
        // Convert to Three.js
        const threePlane = BIMCameraMath.bcfToThreePlane(bcfPlane, THREE);
        
        // Convert back to BCF
        const bcfPlaneRec = BIMCameraMath.threeToBcfPlane(threePlane);

        // Check direction
        assert(Math.abs(bcfPlaneRec.direction.x - dirBcf.x) < 1e-3);
        assert(Math.abs(bcfPlaneRec.direction.y - dirBcf.y) < 1e-3);
        assert(Math.abs(bcfPlaneRec.direction.z - dirBcf.z) < 1e-3);

        // Check recovered location lies on plane: dir . (loc_rec - loc_orig) == 0
        const deltaLoc = new THREE.Vector3(
            bcfPlaneRec.location.x - locBcf.x,
            bcfPlaneRec.location.y - locBcf.y,
            bcfPlaneRec.location.z - locBcf.z
        );
        const distOnPlane = rawDir.dot(deltaLoc);
        assert(Math.abs(distOnPlane) < 1e-3, `Location not on plane: dist=${distOnPlane}`);

        // Check test point distance equality in both spaces
        const testPtThree = new THREE.Vector3(
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 1000
        );
        const distThree = threePlane.distanceToPoint(testPtThree);

        const testPtBcf = BIMCameraMath.threeToBcfVector(testPtThree);
        const deltaBcf = new THREE.Vector3(
            testPtBcf.x - locBcf.x,
            testPtBcf.y - locBcf.y,
            testPtBcf.z - locBcf.z
        );
        const distBcf = rawDir.dot(deltaBcf);
        assert(Math.abs(distThree - distBcf) < 1e-2, `Distance mismatch: Three=${distThree} vs BCF=${distBcf}`);
    }
});

// 5. OrbitControls Target Reconstruction with Accelerated Raycasting
runTest('5.1 BVH Raycaster & OrbitControls Target Reconstruction', () => {
    // Create synthetic box mesh
    const geom = new THREE.BoxGeometry(10, 10, 10);
    geom.computeBoundsTree();
    const mat = new THREE.MeshBasicMaterial();
    const boxMesh = new THREE.Mesh(geom, mat);
    boxMesh.position.set(0, 0, 0);
    boxMesh.updateMatrixWorld();

    const raycaster = new THREE.Raycaster();
    raycaster.firstHitOnly = true;

    // Case 1: Camera aimed at the center of the box from distance 20
    const cameraPos = new THREE.Vector3(0, 0, 20);
    const cameraDir = new THREE.Vector3(0, 0, -1);

    const targetHit = BIMCameraMath.reconstructTarget(cameraPos, cameraDir, raycaster, [boxMesh], 10.0);
    // Intersection should be front face of box at z = +5.0
    assert(Math.abs(targetHit.x - 0.0) < 1e-5);
    assert(Math.abs(targetHit.y - 0.0) < 1e-5);
    assert(Math.abs(targetHit.z - 5.0) < 1e-5, `Expected hit at z=5.0, got z=${targetHit.z}`);

    // Case 2: Camera aimed away from box -> Fallback distance 15.0
    const cameraDirAway = new THREE.Vector3(0, 1, 0);
    const targetFallback = BIMCameraMath.reconstructTarget(cameraPos, cameraDirAway, raycaster, [boxMesh], 15.0);
    const expectedFallback = new THREE.Vector3(0, 15, 20);
    assert(targetFallback.distanceTo(expectedFallback) < 1e-5, `Fallback target mismatch: ${JSON.stringify(targetFallback)}`);
});

// 6. LookAt View Matrix Derivation & Singularity Handling
runTest('6.1 Three.js lookAt Matrix World <-> View Matrix Formulations', () => {
    const eye = new THREE.Vector3(15, 25, 35);
    const target = new THREE.Vector3(-10, 5, -20);
    const up = new THREE.Vector3(0, 1, 0);

    const camera = new THREE.PerspectiveCamera(60, 1.7778, 0.1, 1000);
    camera.position.copy(eye);
    camera.up.copy(up);
    camera.lookAt(target);
    camera.updateMatrixWorld();

    // View matrix in Three.js is camera.matrixWorldInverse
    const V_three = camera.matrixWorldInverse;

    // Theoretical view matrix from Section 6.3
    const f = new THREE.Vector3().subVectors(target, eye).normalize();
    const s = new THREE.Vector3().crossVectors(f, up).normalize();
    const u = new THREE.Vector3().crossVectors(s, f);

    const V_doc = new THREE.Matrix4().set(
        s.x,  s.y,  s.z, -s.dot(eye),
        u.x,  u.y,  u.z, -u.dot(eye),
       -f.x, -f.y, -f.z,  f.dot(eye),
        0,    0,    0,    1
    );

    for (let i = 0; i < 16; i++) {
        assert(Math.abs(V_three.elements[i] - V_doc.elements[i]) < 1e-5, `View matrix element ${i} mismatch`);
    }
});

console.log('\n=============================================================');
console.log(`Test Execution Finished: ${passCount} PASSED, ${failCount} FAILED out of ${passCount + failCount} tests.`);
console.log('=============================================================');

if (failCount > 0) {
    process.exit(1);
}
