"""
Adversarial Pure-Python Empirical Verification Suite for 3D Camera Coordinate Transformations,
Linear Algebra, Projection Conversions, Clipping Planes, and OrbitControls Target Reconstruction.

Standard Library only: math, random, unittest.
Zero external dependencies.
"""

import math
import random
import unittest

# ==============================================================================
# 3D Vector & Matrix Pure-Python Utilities
# ==============================================================================

class Vec3:
    __slots__ = ('x', 'y', 'z')
    def __init__(self, x: float, y: float, z: float):
        self.x = float(x)
        self.y = float(y)
        self.z = float(z)

    def __add__(self, o):
        return Vec3(self.x + o.x, self.y + o.y, self.z + o.z)

    def __sub__(self, o):
        return Vec3(self.x - o.x, self.y - o.y, self.z - o.z)

    def __mul__(self, s: float):
        return Vec3(self.x * s, self.y * s, self.z * s)

    def __rmul__(self, s: float):
        return Vec3(self.x * s, self.y * s, self.z * s)

    def __neg__(self):
        return Vec3(-self.x, -self.y, -self.z)

    def dot(self, o) -> float:
        return self.x * o.x + self.y * o.y + self.z * o.z

    def cross(self, o):
        return Vec3(
            self.y * o.z - self.z * o.y,
            self.z * o.x - self.x * o.z,
            self.x * o.y - self.y * o.x
        )

    def norm(self) -> float:
        return math.sqrt(self.dot(self))

    def normalize(self):
        n = self.norm()
        if n < 1e-12:
            raise ValueError("Cannot normalize near-zero vector")
        return Vec3(self.x / n, self.y / n, self.z / n)

    def to_list(self):
        return [self.x, self.y, self.z]

    def is_close(self, o, atol=1e-7) -> bool:
        return (math.isclose(self.x, o.x, abs_tol=atol) and
                math.isclose(self.y, o.y, abs_tol=atol) and
                math.isclose(self.z, o.z, abs_tol=atol))

    def __repr__(self):
        return f"Vec3({self.x:.6f}, {self.y:.6f}, {self.z:.6f})"


class Mat3:
    def __init__(self, m):
        self.m = [[float(val) for val in row] for row in m]

    def mult_vec(self, v: Vec3) -> Vec3:
        return Vec3(
            self.m[0][0]*v.x + self.m[0][1]*v.y + self.m[0][2]*v.z,
            self.m[1][0]*v.x + self.m[1][1]*v.y + self.m[1][2]*v.z,
            self.m[2][0]*v.x + self.m[2][1]*v.y + self.m[2][2]*v.z
        )

    def mult_mat(self, o):
        res = [[0.0]*3 for _ in range(3)]
        for i in range(3):
            for j in range(3):
                for k in range(3):
                    res[i][j] += self.m[i][k] * o.m[k][j]
        return Mat3(res)

    def transpose(self):
        return Mat3([[self.m[j][i] for j in range(3)] for i in range(3)])

    def det(self) -> float:
        m = self.m
        return (m[0][0]*(m[1][1]*m[2][2] - m[1][2]*m[2][1]) -
                m[0][1]*(m[1][0]*m[2][2] - m[1][2]*m[2][0]) +
                m[0][2]*(m[1][0]*m[2][1] - m[1][1]*m[2][0]))

    def is_identity(self, atol=1e-12) -> bool:
        for i in range(3):
            for j in range(3):
                expected = 1.0 if i == j else 0.0
                if not math.isclose(self.m[i][j], expected, abs_tol=atol):
                    return False
        return True


class Mat4:
    def __init__(self, m):
        self.m = [[float(val) for val in row] for row in m]

    def mult_vec4(self, v4):
        return [
            sum(self.m[r][c] * v4[c] for c in range(4))
            for r in range(4)
        ]

    def mult_mat(self, o):
        res = [[0.0]*4 for _ in range(4)]
        for i in range(4):
            for j in range(4):
                for k in range(4):
                    res[i][j] += self.m[i][k] * o.m[k][j]
        return Mat4(res)

    def is_identity(self, atol=1e-12) -> bool:
        for i in range(4):
            for j in range(4):
                expected = 1.0 if i == j else 0.0
                if not math.isclose(self.m[i][j], expected, abs_tol=atol):
                    return False
        return True


# ==============================================================================
# Transformations Under Test
# ==============================================================================

# R_x(+pi/2): Three -> IFC
R_THREE_TO_IFC = Mat3([
    [1.0,  0.0,  0.0],
    [0.0,  0.0, -1.0],
    [0.0,  1.0,  0.0]
])

# R_x(-pi/2): IFC -> Three
R_IFC_TO_THREE = Mat3([
    [1.0,  0.0,  0.0],
    [0.0,  0.0,  1.0],
    [0.0, -1.0,  0.0]
])

# Homogeneous 4x4
T_THREE_TO_IFC = Mat4([
    [1.0,  0.0,  0.0, 0.0],
    [0.0,  0.0, -1.0, 0.0],
    [0.0,  1.0,  0.0, 0.0],
    [0.0,  0.0,  0.0, 1.0]
])

T_IFC_TO_THREE = Mat4([
    [1.0,  0.0,  0.0, 0.0],
    [0.0,  0.0,  1.0, 0.0],
    [0.0, -1.0,  0.0, 0.0],
    [0.0,  0.0,  0.0, 1.0]
])


class TestCameraMathVerification(unittest.TestCase):

    # ==========================================================================
    # DOMAIN 1: Basis Transformations
    # ==========================================================================
    def test_basis_matrix_orthogonality_and_determinant(self):
        """Verify R_x(+pi/2) and R_x(-pi/2) algebraic properties."""
        self.assertTrue(R_THREE_TO_IFC.transpose().mult_mat(R_THREE_TO_IFC).is_identity())
        self.assertTrue(R_IFC_TO_THREE.transpose().mult_mat(R_IFC_TO_THREE).is_identity())
        self.assertTrue(R_THREE_TO_IFC.mult_mat(R_IFC_TO_THREE).is_identity())
        self.assertTrue(R_IFC_TO_THREE.mult_mat(R_THREE_TO_IFC).is_identity())

        # Determinant = +1 (proper rigid body rotation, preserves chirality)
        self.assertAlmostEqual(R_THREE_TO_IFC.det(), 1.0, places=14)
        self.assertAlmostEqual(R_IFC_TO_THREE.det(), 1.0, places=14)

        # 4x4 Homogeneous matrix product = I_4
        self.assertTrue(T_THREE_TO_IFC.mult_mat(T_IFC_TO_THREE).is_identity())

    def test_basis_vector_mappings(self):
        """Verify physical coordinate mapping between Three.js (Y-up) and IFC (Z-up)."""
        e_x_three = Vec3(1, 0, 0)   # Right (East)
        e_y_three = Vec3(0, 1, 0)   # Elevation (Up)
        e_z_three = Vec3(0, 0, 1)   # Out of screen (South)
        fwd_three = Vec3(0, 0, -1)  # Camera Forward into screen (North)

        u_east = R_THREE_TO_IFC.mult_vec(e_x_three)
        u_up   = R_THREE_TO_IFC.mult_vec(e_y_three)
        u_south= R_THREE_TO_IFC.mult_vec(e_z_three)
        u_north= R_THREE_TO_IFC.mult_vec(fwd_three)

        self.assertTrue(u_east.is_close(Vec3(1, 0, 0)))    # +X_IFC (East)
        self.assertTrue(u_up.is_close(Vec3(0, 0, 1)))      # +Z_IFC (Elevation / Up)
        self.assertTrue(u_south.is_close(Vec3(0, -1, 0)))  # -Y_IFC (South)
        self.assertTrue(u_north.is_close(Vec3(0, 1, 0)))   # +Y_IFC (North / Planar Depth)

        # Right-handed cross products in both frames
        self.assertTrue(e_x_three.cross(e_y_three).is_close(e_z_three))
        self.assertTrue(u_east.cross(u_north).is_close(u_up))

    def test_fuzz_basis_roundtrip_100k(self):
        """Fuzz 100,000 random points to verify exact bijection and isometry."""
        random.seed(42)
        for _ in range(100000):
            x = random.uniform(-10000.0, 10000.0)
            y = random.uniform(-10000.0, 10000.0)
            z = random.uniform(-10000.0, 10000.0)
            p_three = Vec3(x, y, z)

            p_ifc = R_THREE_TO_IFC.mult_vec(p_three)
            self.assertAlmostEqual(p_ifc.x, x, places=10)
            self.assertAlmostEqual(p_ifc.y, -z, places=10)
            self.assertAlmostEqual(p_ifc.z, y, places=10)

            p_rec = R_IFC_TO_THREE.mult_vec(p_ifc)
            self.assertTrue(p_rec.is_close(p_three, atol=1e-10))
            self.assertAlmostEqual(p_three.norm(), p_ifc.norm(), places=10)

    # ==========================================================================
    # DOMAIN 2: Perspective FOV Trigonometry
    # ==========================================================================
    def test_fov_trigonometric_roundtrip_and_frustum(self):
        """Verify FOV_x <-> FOV_y derivations across diverse aspect ratios."""
        aspect_ratios = [
            16.0 / 9.0,   # 1.7778
            4.0 / 3.0,    # 1.3333
            1.0 / 1.0,    # 1.0000
            21.0 / 9.0,   # 2.3333
            32.0 / 9.0,   # 3.5556
            9.0 / 16.0,   # 0.5625
            1.0 / 2.0,    # 0.5000
            10.0,         # Extreme panoramic
            0.1           # Extreme portrait slit
        ]
        test_fov_y = [15.0, 30.0, 45.0, 60.0, 75.0, 90.0, 110.0, 130.0, 150.0]

        for aspect in aspect_ratios:
            for fov_y in test_fov_y:
                rad_y = math.radians(fov_y) / 2.0
                rad_x = math.atan(aspect * math.tan(rad_y))
                fov_x = math.degrees(rad_x) * 2.0

                rad_x_inv = math.radians(fov_x) / 2.0
                rad_y_inv = math.atan((1.0 / aspect) * math.tan(rad_x_inv))
                fov_y_rec = math.degrees(rad_y_inv) * 2.0

                self.assertAlmostEqual(fov_y, fov_y_rec, places=10)

                d = 50.0
                h = 2.0 * d * math.tan(math.radians(fov_y) / 2.0)
                w = 2.0 * d * math.tan(math.radians(fov_x) / 2.0)
                self.assertAlmostEqual(w / h, aspect, places=10)

    def test_fov_js_implementation_and_payload_analysis(self):
        """Test bim_camera_math.js FOV conversion functions and analyze payload precision."""
        def js_v2h(fovYDeg, aspect):
            radY = (fovYDeg * math.pi) / 360.0
            radX = math.atan(aspect * math.tan(radY))
            fovXDeg = (radX * 360.0) / math.pi
            return round(max(10.0, min(160.0, fovXDeg)), 2)

        def js_h2v(fovXDeg, aspect):
            radX = (fovXDeg * math.pi) / 360.0
            radY = math.atan((1.0 / aspect) * math.tan(radX))
            fovYDeg = (radY * 360.0) / math.pi
            return round(max(15.0, min(120.0, fovYDeg)), 2)

        # 1. Verify exact conversion for (fov_x = 60.0, aspect = 1.7778)
        fov_y_16_9 = js_h2v(60.0, 1.7778)
        self.assertEqual(fov_y_16_9, 35.98) # Exact rounded to 2 decimals

        # 2. Verify exact aspect ratio needed for FOV_x=60.0 and FOV_y=36.87:
        tan_half_x = math.tan(math.radians(60.0) / 2.0) # tan(30 deg) = 0.577350
        tan_half_y = math.tan(math.radians(36.87) / 2.0) # tan(18.435 deg) = 0.333334
        implied_aspect = tan_half_x / tan_half_y
        self.assertAlmostEqual(implied_aspect, math.sqrt(3), places=3) # Implied A = sqrt(3) ~= 1.73205

        # 3. Roundtrip across standard FOVs
        for test_deg in [30.0, 45.0, 60.0, 75.0, 90.0]:
            h_fov = js_v2h(test_deg, 16.0 / 9.0)
            rec_v_fov = js_h2v(h_fov, 16.0 / 9.0)
            self.assertAlmostEqual(test_deg, rec_v_fov, delta=0.05)

    # ==========================================================================
    # DOMAIN 3: Orthographic Scale & Frustum Bounds
    # ==========================================================================
    def test_orthographic_scale_and_frustum_bounds(self):
        """Verify ViewToWorldScale mapping to Three.js Orthographic bounds."""
        S_values = [0.5, 2.0, 10.0, 50.0, 250.0]
        aspect_values = [16.0 / 9.0, 4.0 / 3.0, 1.0, 0.5625]
        zoom_values = [0.5, 1.0, 2.0, 3.5]

        for S in S_values:
            for A in aspect_values:
                for zoom in zoom_values:
                    top = +(S * zoom) / 2.0
                    bottom = -(S * zoom) / 2.0
                    right = +(S * zoom * A) / 2.0
                    left = -(S * zoom * A) / 2.0

                    S_v2w = (top - bottom) / zoom
                    self.assertAlmostEqual(S_v2w, S, places=12)

                    top_rec = +S_v2w / 2.0
                    bottom_rec = -S_v2w / 2.0
                    right_rec = +(S_v2w * A) / 2.0
                    left_rec = -(S_v2w * A) / 2.0

                    self.assertAlmostEqual(top_rec - bottom_rec, S, places=12)
                    self.assertAlmostEqual(right_rec - left_rec, S * A, places=12)
                    self.assertAlmostEqual((right_rec - left_rec) / (top_rec - bottom_rec), A, places=12)

    def test_orthographic_projection_matrix_ndc(self):
        """Verify 4x4 orthographic projection matrix corner transformations into NDC [-1, 1]^3."""
        S = 30.0
        A = 16.0 / 9.0
        z_near = 0.5
        z_far = 500.0

        P_ortho = Mat4([
            [2.0 / (S * A), 0.0,       0.0,                          0.0],
            [0.0,           2.0 / S,   0.0,                          0.0],
            [0.0,           0.0,      -2.0 / (z_far - z_near),       -(z_far + z_near) / (z_far - z_near)],
            [0.0,           0.0,       0.0,                          1.0]
        ])

        ndc_rtn = P_ortho.mult_vec4([S * A / 2.0, S / 2.0, -z_near, 1.0])
        self.assertAlmostEqual(ndc_rtn[0],  1.0, places=10) # +X
        self.assertAlmostEqual(ndc_rtn[1],  1.0, places=10) # +Y
        self.assertAlmostEqual(ndc_rtn[2], -1.0, places=10) # -Z (near plane in OpenGL NDC)
        self.assertAlmostEqual(ndc_rtn[3],  1.0, places=10)

        ndc_lbf = P_ortho.mult_vec4([-S * A / 2.0, -S / 2.0, -z_far, 1.0])
        self.assertAlmostEqual(ndc_lbf[0], -1.0, places=10) # -X
        self.assertAlmostEqual(ndc_lbf[1], -1.0, places=10) # -Y
        self.assertAlmostEqual(ndc_lbf[2],  1.0, places=10) # +Z (far plane in OpenGL NDC)
        self.assertAlmostEqual(ndc_lbf[3],  1.0, places=10)

    # ==========================================================================
    # DOMAIN 4: 3D Clipping Planes & Hessian Normal Form
    # ==========================================================================
    def test_clipping_plane_invariance_50k(self):
        """Fuzz 50,000 random clipping planes to verify exact half-space signed distance preservation."""
        random.seed(123)
        for _ in range(50000):
            loc_bcf = Vec3(random.uniform(-500, 500), random.uniform(-500, 500), random.uniform(-500, 500))
            dir_raw = Vec3(random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1))
            if dir_raw.norm() < 1e-4:
                continue
            dir_bcf = dir_raw.normalize()

            n_three = R_IFC_TO_THREE.mult_vec(dir_bcf).normalize()
            loc_three = R_IFC_TO_THREE.mult_vec(loc_bcf)
            c_three = -n_three.dot(loc_three)

            dir_bcf_rec = R_THREE_TO_IFC.mult_vec(n_three)
            loc_three_closest = -c_three * n_three
            loc_bcf_rec = R_THREE_TO_IFC.mult_vec(loc_three_closest)

            self.assertTrue(dir_bcf_rec.is_close(dir_bcf, atol=1e-10))

            dist_loc = dir_bcf.dot(loc_bcf_rec - loc_bcf)
            self.assertAlmostEqual(dist_loc, 0.0, places=10)

            x_three = Vec3(random.uniform(-1000, 1000), random.uniform(-1000, 1000), random.uniform(-1000, 1000))
            x_bcf = R_THREE_TO_IFC.mult_vec(x_three)

            dist_three = n_three.dot(x_three) + c_three
            dist_bcf   = dir_bcf.dot(x_bcf - loc_bcf)
            self.assertAlmostEqual(dist_three, dist_bcf, places=10)

    def test_clipping_plane_doc_example(self):
        """Verify Section 7.1 Viewpoint Payload 2 clipping plane transformation."""
        loc_bcf = Vec3(12.0, 50.0, 7.5)
        dir_bcf = Vec3(0.0, 0.0, -1.0)

        n_three = R_IFC_TO_THREE.mult_vec(dir_bcf).normalize()
        loc_three = R_IFC_TO_THREE.mult_vec(loc_bcf)
        c_three = -n_three.dot(loc_three)

        self.assertTrue(n_three.is_close(Vec3(0.0, -1.0, 0.0)))
        self.assertTrue(loc_three.is_close(Vec3(12.0, 7.5, -50.0)))
        self.assertAlmostEqual(c_three, 7.5, places=14)

    # ==========================================================================
    # DOMAIN 5: Look-At View Matrix & Target Reconstruction
    # ==========================================================================
    def test_look_at_view_matrix_properties_1000(self):
        """Verify Look-At view matrix orthonormality and eye/target transformations."""
        random.seed(999)
        for _ in range(1000):
            eye = Vec3(random.uniform(-100, 100), random.uniform(-100, 100), random.uniform(-100, 100))
            target = Vec3(random.uniform(-100, 100), random.uniform(-100, 100), random.uniform(-100, 100))
            delta = target - eye
            if delta.norm() < 1.0:
                continue

            f = delta.normalize()
            up = Vec3(0, 1, 0)
            
            if abs(f.dot(up)) > 0.9999:
                up = Vec3(0, 0, -1)

            s = f.cross(up).normalize()
            u = s.cross(f)

            V = Mat4([
                [ s.x,  s.y,  s.z, -s.dot(eye)],
                [ u.x,  u.y,  u.z, -u.dot(eye)],
                [-f.x, -f.y, -f.z,  f.dot(eye)],
                [ 0.0,  0.0,  0.0,  1.0]
            ])

            R_view = Mat3([
                [ s.x,  s.y,  s.z],
                [ u.x,  u.y,  u.z],
                [-f.x, -f.y, -f.z]
            ])
            self.assertTrue(R_view.mult_mat(R_view.transpose()).is_identity(atol=1e-10))
            self.assertAlmostEqual(R_view.det(), 1.0, places=10)

            eye_trans = V.mult_vec4([eye.x, eye.y, eye.z, 1.0])
            self.assertAlmostEqual(eye_trans[0], 0.0, places=10)
            self.assertAlmostEqual(eye_trans[1], 0.0, places=10)
            self.assertAlmostEqual(eye_trans[2], 0.0, places=10)
            self.assertAlmostEqual(eye_trans[3], 1.0, places=10)

            dist = delta.norm()
            tgt_trans = V.mult_vec4([target.x, target.y, target.z, 1.0])
            self.assertAlmostEqual(tgt_trans[0], 0.0, places=10)
            self.assertAlmostEqual(tgt_trans[1], 0.0, places=10)
            self.assertAlmostEqual(tgt_trans[2], -dist, places=10)
            self.assertAlmostEqual(tgt_trans[3], 1.0, places=10)

    def test_zenith_and_nadir_singularities(self):
        """Verify fallback handling when camera looks straight up (+Y) or down (-Y)."""
        eye = Vec3(10, 20, 30)
        up = Vec3(0, 1, 0)
        fallback_up = Vec3(0, 0, -1)

        # 1. Zenith view: Looking straight up along +Y
        f_zenith = Vec3(0, 1, 0)
        s_zenith = f_zenith.cross(fallback_up).normalize()
        u_zenith = s_zenith.cross(f_zenith)

        self.assertTrue(s_zenith.is_close(Vec3(-1, 0, 0)))
        self.assertTrue(u_zenith.is_close(Vec3(0, 0, -1)))
        self.assertAlmostEqual(s_zenith.dot(u_zenith), 0.0, places=14)
        self.assertAlmostEqual(s_zenith.dot(f_zenith), 0.0, places=14)
        self.assertAlmostEqual(u_zenith.dot(f_zenith), 0.0, places=14)

        # 2. Nadir view: Looking straight down along -Y
        f_nadir = Vec3(0, -1, 0)
        s_nadir = f_nadir.cross(fallback_up).normalize()
        u_nadir = s_nadir.cross(f_nadir)

        self.assertTrue(s_nadir.is_close(Vec3(1, 0, 0)))
        self.assertTrue(u_nadir.is_close(Vec3(0, 0, -1)))
        self.assertAlmostEqual(s_nadir.dot(u_nadir), 0.0, places=14)
        self.assertAlmostEqual(s_nadir.dot(f_nadir), 0.0, places=14)
        self.assertAlmostEqual(u_nadir.dot(f_nadir), 0.0, places=14)


if __name__ == '__main__':
    unittest.main(verbosity=2)
