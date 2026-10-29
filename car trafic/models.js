// 3D Procedural Models & Environment Generator using Three.js
// Designed with a sleek, minimalist, restrained dark aesthetic

const ModelBuilder = {
    // Shared materials for performance and aesthetic consistency
    materials: {
        tire: new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.9, metalness: 0.1 }),
        rim: new THREE.MeshStandardMaterial({ color: 0x888c96, roughness: 0.2, metalness: 0.9 }),
        brakeDisc: new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8, roughness: 0.3 }),
        glass: new THREE.MeshStandardMaterial({
            color: 0x05070a,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.85
        }),
        carbonTrim: new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.6, metalness: 0.4 }),
        headlight: new THREE.MeshBasicMaterial({ color: 0xe6f4ff }),
        taillight: new THREE.MeshBasicMaterial({ color: 0xff1e27 }),
        reverseLight: new THREE.MeshBasicMaterial({ color: 0xffffff }),
        asphalt: new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.85, metalness: 0.15 }),
        roadMarking: new THREE.MeshBasicMaterial({ color: 0xcccccc }),
        barrier: new THREE.MeshStandardMaterial({ color: 0x242830, roughness: 0.7, metalness: 0.3 }),
        building: new THREE.MeshStandardMaterial({ color: 0x0d0f14, roughness: 0.8, metalness: 0.2 }),
        windowGlow: new THREE.MeshBasicMaterial({ color: 0x5a6577 })
    },

    // Create the player's high-performance sports car
    createPlayerCar(bodyColorHex = 0x1c2028) {
        const carGroup = new THREE.Group();
        carGroup.name = "PlayerCar";

        const carBodyMat = new THREE.MeshStandardMaterial({
            color: bodyColorHex,
            roughness: 0.25,
            metalness: 0.85,
            envMapIntensity: 1.2
        });

        // 1. Lower main chassis (sleek aerodynamic wedge)
        const lowerBodyGeom = new THREE.BoxGeometry(1.85, 0.42, 4.3);
        const lowerBody = new THREE.Mesh(lowerBodyGeom, carBodyMat);
        lowerBody.position.y = 0.42;
        lowerBody.castShadow = true;
        carGroup.add(lowerBody);

        // Front nose slope (streamlined sports bumper)
        const noseGeom = new THREE.BoxGeometry(1.82, 0.28, 0.8);
        const nose = new THREE.Mesh(noseGeom, carBodyMat);
        nose.position.set(0, 0.32, 2.3);
        nose.rotation.x = 0.12;
        nose.castShadow = true;
        carGroup.add(nose);

        // Front splitter (carbon fiber chin)
        const splitterGeom = new THREE.BoxGeometry(1.9, 0.08, 0.6);
        const splitter = new THREE.Mesh(splitterGeom, this.materials.carbonTrim);
        splitter.position.set(0, 0.16, 2.35);
        carGroup.add(splitter);

        // 2. Cockpit / Greenhouse (sleek cabin)
        const cabinGeom = new THREE.BoxGeometry(1.45, 0.52, 2.1);
        const cabin = new THREE.Mesh(cabinGeom, this.materials.glass);
        cabin.position.set(0, 0.82, -0.2);
        cabin.castShadow = true;
        carGroup.add(cabin);

        // Roof panel
        const roofGeom = new THREE.BoxGeometry(1.4, 0.06, 1.4);
        const roof = new THREE.Mesh(roofGeom, carBodyMat);
        roof.position.set(0, 1.09, -0.2);
        carGroup.add(roof);

        // 3. Rear diffuser and aerodynamic wing/spoiler
        const diffuserGeom = new THREE.BoxGeometry(1.82, 0.25, 0.5);
        const diffuser = new THREE.Mesh(diffuserGeom, this.materials.carbonTrim);
        diffuser.position.set(0, 0.28, -2.2);
        carGroup.add(diffuser);

        // Spoiler mounts
        const mountMat = this.materials.carbonTrim;
        const mount1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.18), mountMat);
        mount1.position.set(0.55, 0.75, -2.0);
        const mount2 = mount1.clone();
        mount2.position.set(-0.55, 0.75, -2.0);
        carGroup.add(mount1, mount2);

        // Spoiler blade
        const wingGeom = new THREE.BoxGeometry(1.86, 0.06, 0.38);
        const wing = new THREE.Mesh(wingGeom, carBodyMat);
        wing.position.set(0, 0.89, -2.02);
        wing.rotation.x = -0.06;
        wing.castShadow = true;
        carGroup.add(wing);

        // Side skirts
        const skirtL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 2.5), this.materials.carbonTrim);
        skirtL.position.set(0.96, 0.22, 0);
        const skirtR = skirtL.clone();
        skirtR.position.x = -0.96;
        carGroup.add(skirtL, skirtR);

        // 4. Wheels & Suspension
        const wheels = [];
        const wheelCoords = [
            { x: -0.95, y: 0.36, z: 1.35, isFront: true },   // Front Left
            { x: 0.95, y: 0.36, z: 1.35, isFront: true },    // Front Right
            { x: -0.96, y: 0.38, z: -1.35, isFront: false }, // Rear Left
            { x: 0.96, y: 0.38, z: -1.35, isFront: false }   // Rear Right
        ];

        wheelCoords.forEach(coord => {
            const wheelAnchor = new THREE.Group();
            wheelAnchor.position.set(coord.x, coord.y, coord.z);

            const wheelMesh = new THREE.Group();
            
            // Rubber tire
            const tireGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.26, 20);
            tireGeom.rotateZ(Math.PI / 2);
            const tire = new THREE.Mesh(tireGeom, this.materials.tire);
            tire.castShadow = true;
            wheelMesh.add(tire);

            // Metal alloy rim
            const rimGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.27, 12);
            rimGeom.rotateZ(Math.PI / 2);
            const rim = new THREE.Mesh(rimGeom, this.materials.rim);
            wheelMesh.add(rim);

            // Wheel spokes detail
            const spokeGeom = new THREE.BoxGeometry(0.04, 0.44, 0.272);
            const spoke1 = new THREE.Mesh(spokeGeom, this.materials.rim);
            const spoke2 = spoke1.clone();
            spoke2.rotation.x = Math.PI / 3;
            const spoke3 = spoke1.clone();
            spoke3.rotation.x = -Math.PI / 3;
            wheelMesh.add(spoke1, spoke2, spoke3);

            wheelAnchor.add(wheelMesh);
            carGroup.add(wheelAnchor);

            wheels.push({
                anchor: wheelAnchor,
                mesh: wheelMesh,
                isFront: coord.isFront
            });
        });

        // 5. Headlights (Laser LED style)
        const hlGeom = new THREE.BoxGeometry(0.42, 0.1, 0.08);
        const hlLeft = new THREE.Mesh(hlGeom, this.materials.headlight);
        hlLeft.position.set(0.64, 0.46, 2.22);
        hlLeft.rotation.y = -0.15;
        const hlRight = hlLeft.clone();
        hlRight.position.x = -0.64;
        hlRight.rotation.y = 0.15;
        carGroup.add(hlLeft, hlRight);

        // Spotlights casting forward light onto the road
        const spotL = new THREE.SpotLight(0xe6f4ff, 2.5, 45, Math.PI / 6, 0.4, 1.2);
        spotL.position.set(0.64, 0.5, 2.2);
        spotL.target.position.set(0.64, 0, 18);
        carGroup.add(spotL);
        carGroup.add(spotL.target);

        const spotR = new THREE.SpotLight(0xe6f4ff, 2.5, 45, Math.PI / 6, 0.4, 1.2);
        spotR.position.set(-0.64, 0.5, 2.2);
        spotR.target.position.set(-0.64, 0, 18);
        carGroup.add(spotR);
        carGroup.add(spotR.target);

        // 6. Modern Continuous Tail Light Bar
        const tailBarGeom = new THREE.BoxGeometry(1.68, 0.08, 0.08);
        const tailBar = new THREE.Mesh(tailBarGeom, this.materials.taillight);
        tailBar.position.set(0, 0.54, -2.18);
        carGroup.add(tailBar);

        // Subtle rear red point light
        const tailGlow = new THREE.PointLight(0xff1122, 1.2, 8);
        tailGlow.position.set(0, 0.54, -2.4);
        carGroup.add(tailGlow);

        // Dual Exhaust Tips (for Nitro Flames)
        const exhaustGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.25, 12);
        exhaustGeom.rotateX(Math.PI / 2);
        const exL = new THREE.Mesh(exhaustGeom, this.materials.carbonTrim);
        exL.position.set(0.38, 0.22, -2.2);
        const exR = exL.clone();
        exR.position.x = -0.38;
        carGroup.add(exL, exR);

        // Nitro Flame Meshes (hidden by default)
        const flameGeom = new THREE.ConeGeometry(0.12, 0.85, 8);
        flameGeom.rotateX(-Math.PI / 2);
        const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.9 });
        const flameL = new THREE.Mesh(flameGeom, flameMat);
        flameL.position.set(0.38, 0.22, -2.75);
        flameL.visible = false;
        const flameR = flameL.clone();
        flameR.position.x = -0.38;
        flameR.visible = false;
        carGroup.add(flameL, flameR);

        return {
            group: carGroup,
            bodyMesh: lowerBody,
            bodyMat: carBodyMat,
            wheels: wheels,
            flames: [flameL, flameR],
            spotlights: [spotL, spotR],
            tailGlow: tailGlow
        };
    },

    // Create varied traffic vehicles (Executive Sedan, Heavy Semi Truck, SUV)
    createTrafficVehicle(type = 'sedan') {
        const group = new THREE.Group();
        group.name = "Traffic_" + type;

        // Monochrome subtle palette for traffic
        const trafficColors = [0x22262e, 0x181a1f, 0x343942, 0x2e3035, 0x121417];
        const randomColor = trafficColors[Math.floor(Math.random() * trafficColors.length)];
        const trafficBodyMat = new THREE.MeshStandardMaterial({
            color: randomColor,
            roughness: 0.4,
            metalness: 0.6
        });

        let length = 4.2;
        let width = 1.8;
        let height = 1.35;
        let speed = 40 + Math.random() * 25;

        if (type === 'truck') {
            length = 9.2;
            width = 2.3;
            height = 3.2;
            speed = 28 + Math.random() * 15;

            // Semi Cab
            const cab = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.6, 2.5), trafficBodyMat);
            cab.position.set(0, 1.5, 3.2);
            cab.castShadow = true;
            group.add(cab);

            // Cab Windshield
            const wind = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.1, 0.2), this.materials.glass);
            wind.position.set(0, 2.1, 4.4);
            group.add(wind);

            // Cargo Trailer (Industrial metallic)
            const trailerMat = new THREE.MeshStandardMaterial({ color: 0x282c34, roughness: 0.7, metalness: 0.4 });
            const trailer = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.9, 6.4), trailerMat);
            trailer.position.set(0, 1.7, -1.3);
            trailer.castShadow = true;
            group.add(trailer);

            // Heavy wheels
            [-3.8, -2.6, 3.2].forEach(z => {
                [-1.15, 1.15].forEach(x => {
                    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.3, 14), this.materials.tire);
                    w.rotateZ(Math.PI / 2);
                    w.position.set(x, 0.44, z);
                    group.add(w);
                });
            });

            // Tail lights
            const tl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.05), this.materials.taillight);
            tl.position.set(0.9, 0.7, -4.52);
            const tr = tl.clone();
            tr.position.x = -0.9;
            group.add(tl, tr);

        } else if (type === 'suv') {
            length = 4.5;
            width = 1.95;
            height = 1.65;
            speed = 36 + Math.random() * 25;

            // Main body
            const body = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.65, 4.5), trafficBodyMat);
            body.position.set(0, 0.65, 0);
            body.castShadow = true;
            group.add(body);

            // High cabin
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.72, 2.8), this.materials.glass);
            cabin.position.set(0, 1.25, -0.2);
            group.add(cabin);

            // Roof
            const roof = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.08, 2.8), trafficBodyMat);
            roof.position.set(0, 1.62, -0.2);
            group.add(roof);

            // Wheels
            [-1.4, 1.4].forEach(z => {
                [-1.0, 1.0].forEach(x => {
                    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.26, 14), this.materials.tire);
                    w.rotateZ(Math.PI / 2);
                    w.position.set(x, 0.38, z);
                    group.add(w);
                });
            });

            // Lights
            const tl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.05), this.materials.taillight);
            tl.position.set(0.7, 0.75, -2.26);
            const tr = tl.clone();
            tr.position.x = -0.7;
            group.add(tl, tr);

        } else {
            // Executive Sedan
            length = 4.3;
            width = 1.82;
            height = 1.32;
            speed = 42 + Math.random() * 30;

            const body = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.45, 4.3), trafficBodyMat);
            body.position.set(0, 0.46, 0);
            body.castShadow = true;
            group.add(body);

            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 2.2), this.materials.glass);
            cabin.position.set(0, 0.9, -0.15);
            group.add(cabin);

            const roof = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.05, 1.6), trafficBodyMat);
            roof.position.set(0, 1.16, -0.15);
            group.add(roof);

            [-1.3, 1.3].forEach(z => {
                [-0.92, 0.92].forEach(x => {
                    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14), this.materials.tire);
                    w.rotateZ(Math.PI / 2);
                    w.position.set(x, 0.34, z);
                    group.add(w);
                });
            });

            // Tail lights
            const tl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.05), this.materials.taillight);
            tl.position.set(0.65, 0.55, -2.16);
            const tr = tl.clone();
            tr.position.x = -0.65;
            group.add(tl, tr);
        }

        // Forward headlights for oncoming or traffic visibility
        const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.05), this.materials.headlight);
        hlL.position.set(width * 0.36, 0.5, length * 0.5 + 0.02);
        const hlR = hlL.clone();
        hlR.position.x = -width * 0.36;
        group.add(hlL, hlR);

        return {
            group: group,
            type: type,
            width: width,
            length: length,
            height: height,
            speed: speed,
            targetLane: 0,
            currentLane: 0,
            laneChangeTimer: 2 + Math.random() * 6
        };
    },

    // Infinite Road Segment Generator (Modular highway pieces)
    createRoadSegment(length = 120, roadWidth = 18) {
        const segment = new THREE.Group();
        segment.name = "RoadSegment";

        // 1. Asphalt Deck
        const roadGeom = new THREE.PlaneGeometry(roadWidth, length);
        roadGeom.rotateX(-Math.PI / 2);
        const road = new THREE.Mesh(roadGeom, this.materials.asphalt);
        road.receiveShadow = true;
        segment.add(road);

        // 2. Dashed Lane Markings (4 lanes total => 3 dividing lines)
        const laneXOffsets = [-4.5, 0, 4.5];
        const dashCount = Math.floor(length / 8);
        const dashGeom = new THREE.PlaneGeometry(0.22, 4.2);
        dashGeom.rotateX(-Math.PI / 2);

        laneXOffsets.forEach(xOffset => {
            for (let i = 0; i < dashCount; i++) {
                const dash = new THREE.Mesh(dashGeom, this.materials.roadMarking);
                dash.position.set(xOffset, 0.015, -length / 2 + (i * 8) + 4);
                segment.add(dash);
            }
        });

        // 3. Solid Shoulder Lines (Edge borders)
        const edgeLineGeom = new THREE.PlaneGeometry(0.28, length);
        edgeLineGeom.rotateX(-Math.PI / 2);
        const leftEdge = new THREE.Mesh(edgeLineGeom, this.materials.roadMarking);
        leftEdge.position.set(-roadWidth / 2 + 0.4, 0.015, 0);
        const rightEdge = leftEdge.clone();
        rightEdge.position.x = roadWidth / 2 - 0.4;
        segment.add(leftEdge, rightEdge);

        // 4. Concrete Guardrails / Barriers with Light Reflectors
        const barrierGeom = new THREE.BoxGeometry(0.45, 0.8, length);
        const leftBarrier = new THREE.Mesh(barrierGeom, this.materials.barrier);
        leftBarrier.position.set(-roadWidth / 2 - 0.25, 0.4, 0);
        leftBarrier.castShadow = true;
        const rightBarrier = leftBarrier.clone();
        rightBarrier.position.x = roadWidth / 2 + 0.25;
        segment.add(leftBarrier, rightBarrier);

        // 5. Overhead Gantries / Street Lights along the segment
        const lampInterval = 40;
        const lampCount = Math.floor(length / lampInterval);
        for (let i = 0; i < lampCount; i++) {
            const zPos = -length / 2 + i * lampInterval + lampInterval / 2;
            const lampGroup = this.createStreetLamp(roadWidth);
            lampGroup.position.set(0, 0, zPos);
            segment.add(lampGroup);
        }

        // 6. Minimalist Distant Skyscrapers / Monoliths on both sides
        const buildingCount = 6;
        for (let i = 0; i < buildingCount; i++) {
            const side = (i % 2 === 0) ? -1 : 1;
            const bWidth = 14 + Math.random() * 20;
            const bDepth = 14 + Math.random() * 20;
            const bHeight = 35 + Math.random() * 65;
            const bDist = (roadWidth / 2 + 25 + Math.random() * 35) * side;
            const bZ = -length / 2 + (i / buildingCount) * length;

            const bGeom = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
            const buildingMesh = new THREE.Mesh(bGeom, this.materials.building);
            buildingMesh.position.set(bDist, bHeight / 2 - 2, bZ);
            segment.add(buildingMesh);

            // Subtle vertical window strips
            if (Math.random() > 0.4) {
                const stripGeom = new THREE.BoxGeometry(0.3, bHeight * 0.7, 0.3);
                const strip = new THREE.Mesh(stripGeom, this.materials.windowGlow);
                strip.position.set(bDist - side * (bWidth / 2 + 0.2), bHeight / 2, bZ);
                segment.add(strip);
            }
        }

        return segment;
    },

    // Modern Street Lamp post with downward illuminated pool
    createStreetLamp(roadWidth) {
        const lampGroup = new THREE.Group();
        const poleMat = this.materials.barrier;

        // Vertical pole
        const poleGeom = new THREE.CylinderGeometry(0.12, 0.16, 8.5, 8);
        const poleLeft = new THREE.Mesh(poleGeom, poleMat);
        poleLeft.position.set(-roadWidth / 2 - 1.2, 4.25, 0);
        lampGroup.add(poleLeft);

        // Horizontal cantilever arm extending over road
        const armGeom = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8);
        armGeom.rotateZ(Math.PI / 2.3);
        const armLeft = new THREE.Mesh(armGeom, poleMat);
        armLeft.position.set(-roadWidth / 2 + 0.2, 8.2, 0);
        lampGroup.add(armLeft);

        // Lamp fixture head
        const fixtureGeom = new THREE.BoxGeometry(0.8, 0.15, 0.35);
        const fixtureLeft = new THREE.Mesh(fixtureGeom, this.materials.headlight);
        fixtureLeft.position.set(-roadWidth / 2 + 1.6, 8.2, 0);
        lampGroup.add(fixtureLeft);

        // Right side pole
        const poleRight = poleLeft.clone();
        poleRight.position.x = roadWidth / 2 + 1.2;
        lampGroup.add(poleRight);

        const armRight = armLeft.clone();
        armRight.rotation.z = -Math.PI / 2.3;
        armRight.position.x = roadWidth / 2 - 0.2;
        lampGroup.add(armRight);

        const fixtureRight = fixtureLeft.clone();
        fixtureRight.position.x = roadWidth / 2 - 1.6;
        lampGroup.add(fixtureRight);

        return lampGroup;
    }
};

window.ModelBuilder = ModelBuilder;
