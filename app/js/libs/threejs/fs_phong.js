/* Fragment Shader */
#define PHONG
uniform vec3 diffuse;
uniform float opacity;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
#ifdef USE_COLOR

	varying vec3 vColor;

#endif

#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP )

	varying vec2 vUv;

#endif

#ifdef USE_MAP

	uniform sampler2D map;

#endif
#ifdef USE_ALPHAMAP

	uniform sampler2D alphaMap;

#endif

#ifdef USE_LIGHTMAP

	varying vec2 vUv2;
	uniform sampler2D lightMap;

#endif
#ifdef USE_ENVMAP

	uniform float reflectivity;
	uniform samplerCube envMap;
	uniform float flipEnvMap;
	uniform int combine;

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )

		uniform bool useRefract;
		uniform float refractionRatio;

	#else

		varying vec3 vReflect;

	#endif

#endif
#ifdef USE_FOG

	uniform vec3 fogColor;

	#ifdef FOG_EXP2

		uniform float fogDensity;

	#else

		uniform float fogNear;
		uniform float fogFar;
	#endif

#endif
uniform vec3 ambientLightColor;

#if MAX_DIR_LIGHTS > 0

	uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
	uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];

#endif

#if MAX_HEMI_LIGHTS > 0

	uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
	uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
	uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];

#endif

#if MAX_POINT_LIGHTS > 0

	uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];

	uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];
	uniform float pointLightDistance[ MAX_POINT_LIGHTS ];

#endif

#if MAX_SPOT_LIGHTS > 0

	uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];
	uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];
	uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];
	uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];
	uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];

	uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];

#endif

#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )

	varying vec3 vWorldPosition;

#endif

#ifdef WRAP_AROUND

	uniform vec3 wrapRGB;

#endif

varying vec3 vViewPosition;
varying vec3 vNormal;
#ifdef USE_SHADOWMAP

	uniform sampler2D shadowMap[ MAX_SHADOWS ];
	uniform vec2 shadowMapSize[ MAX_SHADOWS ];

	uniform float shadowDarkness[ MAX_SHADOWS ];
	uniform float shadowBias[ MAX_SHADOWS ];

	varying vec4 vShadowCoord[ MAX_SHADOWS ];

	float unpackDepth( const in vec4 rgba_depth ) {

		const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
		float depth = dot( rgba_depth, bit_shift );
		return depth;

	}

#endif
#ifdef USE_BUMPMAP

	uniform sampler2D bumpMap;
	uniform float bumpScale;

			// Derivative maps - bump mapping unparametrized surfaces by Morten Mikkelsen
			//	http://mmikkelsen3d.blogspot.sk/2011/07/derivative-maps.html

			// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

	vec2 dHdxy_fwd() {

		vec2 dSTdx = dFdx( vUv );
		vec2 dSTdy = dFdy( vUv );

		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;

		return vec2( dBx, dBy );

	}

	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {

		vec3 vSigmaX = dFdx( surf_pos );
		vec3 vSigmaY = dFdy( surf_pos );
		vec3 vN = surf_norm;		// normalized

		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );

		float fDet = dot( vSigmaX, R1 );

		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );

	}

#endif
#ifdef USE_NORMALMAP

	uniform sampler2D normalMap;
	uniform vec2 normalScale;

			// Per-Pixel Tangent Space Normal Mapping
			// http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html

	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {

		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( vUv.st );
		vec2 st1 = dFdy( vUv.st );

		vec3 S = normalize( q0 * st1.t - q1 * st0.t );
		vec3 T = normalize( -q0 * st1.s + q1 * st0.s );
		vec3 N = normalize( surf_norm );

		vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
		mapN.xy = normalScale * mapN.xy;
		mat3 tsn = mat3( S, T, N );
		return normalize( tsn * mapN );

	}

#endif

#ifdef USE_SPECULARMAP

	uniform sampler2D specularMap;

#endif
#ifdef USE_LOGDEPTHBUF

	uniform float logDepthBufFC;

	#ifdef USE_LOGDEPTHBUF_EXT

		#extension GL_EXT_frag_depth : enable
		varying float vFragDepth;

	#endif

#endif
void main() {
	gl_FragColor = vec4( vec3( 1.0 ), opacity );
#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)

	gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;

#endif
#ifdef USE_MAP

	vec4 texelColor = texture2D( map, vUv );

	#ifdef GAMMA_INPUT

		texelColor.xyz *= texelColor.xyz;

	#endif

	gl_FragColor = gl_FragColor * texelColor;

#endif
#ifdef USE_ALPHAMAP

	gl_FragColor.a *= texture2D( alphaMap, vUv ).g;

#endif

#ifdef ALPHATEST

	if ( gl_FragColor.a < ALPHATEST ) discard;

#endif

float specularStrength;

#ifdef USE_SPECULARMAP

	vec4 texelSpecular = texture2D( specularMap, vUv );
	specularStrength = texelSpecular.r;

#else

	specularStrength = 1.0;

#endif
vec3 normal = normalize( vNormal );
vec3 viewPosition = normalize( vViewPosition );

#ifdef DOUBLE_SIDED

	normal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );

#endif

#ifdef USE_NORMALMAP

	normal = perturbNormal2Arb( -vViewPosition, normal );

#elif defined( USE_BUMPMAP )

	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );

#endif

#if MAX_POINT_LIGHTS > 0

	vec3 pointDiffuse = vec3( 0.0 );
	vec3 pointSpecular = vec3( 0.0 );

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );
		vec3 lVector = lPosition.xyz + vViewPosition.xyz;

		float lDistance = 1.0;
		if ( pointLightDistance[ i ] > 0.0 )
			lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );

		lVector = normalize( lVector );

				// diffuse

		float dotProduct = dot( normal, lVector );

		#ifdef WRAP_AROUND

			float pointDiffuseWeightFull = max( dotProduct, 0.0 );
			float pointDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );

			vec3 pointDiffuseWeight = mix( vec3( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );

		#else

			float pointDiffuseWeight = max( dotProduct, 0.0 );

		#endif

		pointDiffuse += diffuse * pointLightColor[ i ] * pointDiffuseWeight * lDistance;

				// specular

		vec3 pointHalfVector = normalize( lVector + viewPosition );
		float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );
		float pointSpecularWeight = specularStrength * max( pow( pointDotNormalHalf, shininess ), 0.0 );

		float specularNormalization = ( shininess + 2.0 ) / 8.0;

		vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, pointHalfVector ), 0.0 ), 5.0 );
		pointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * lDistance * specularNormalization;

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	vec3 spotDiffuse = vec3( 0.0 );
	vec3 spotSpecular = vec3( 0.0 );

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );
		vec3 lVector = lPosition.xyz + vViewPosition.xyz;

		float lDistance = 1.0;
		if ( spotLightDistance[ i ] > 0.0 )
			lDistance = 1.0 - min( ( length( lVector ) / spotLightDistance[ i ] ), 1.0 );

		lVector = normalize( lVector );

		float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );

		if ( spotEffect > spotLightAngleCos[ i ] ) {

			spotEffect = max( pow( max( spotEffect, 0.0 ), spotLightExponent[ i ] ), 0.0 );

					// diffuse

			float dotProduct = dot( normal, lVector );

			#ifdef WRAP_AROUND

				float spotDiffuseWeightFull = max( dotProduct, 0.0 );
				float spotDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );

				vec3 spotDiffuseWeight = mix( vec3( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );

			#else

				float spotDiffuseWeight = max( dotProduct, 0.0 );

			#endif

			spotDiffuse += diffuse * spotLightColor[ i ] * spotDiffuseWeight * lDistance * spotEffect;

					// specular

			vec3 spotHalfVector = normalize( lVector + viewPosition );
			float spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );
			float spotSpecularWeight = specularStrength * max( pow( spotDotNormalHalf, shininess ), 0.0 );

			float specularNormalization = ( shininess + 2.0 ) / 8.0;

			vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, spotHalfVector ), 0.0 ), 5.0 );
			spotSpecular += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * lDistance * specularNormalization * spotEffect;

		}

	}

#endif

#if MAX_DIR_LIGHTS > 0

	vec3 dirDiffuse = vec3( 0.0 );
	vec3 dirSpecular = vec3( 0.0 );

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );
		vec3 dirVector = normalize( lDirection.xyz );

				// diffuse

		float dotProduct = dot( normal, dirVector );

		#ifdef WRAP_AROUND

			float dirDiffuseWeightFull = max( dotProduct, 0.0 );
			float dirDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );

			vec3 dirDiffuseWeight = mix( vec3( dirDiffuseWeightFull ), vec3( dirDiffuseWeightHalf ), wrapRGB );

		#else

			float dirDiffuseWeight = max( dotProduct, 0.0 );

		#endif

		dirDiffuse += diffuse * directionalLightColor[ i ] * dirDiffuseWeight;

		// specular

		vec3 dirHalfVector = normalize( dirVector + viewPosition );
		float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );
		float dirSpecularWeight = specularStrength * max( pow( dirDotNormalHalf, shininess ), 0.0 );

		/*
		// fresnel term from skin shader
		const float F0 = 0.128;

		float base = 1.0 - dot( viewPosition, dirHalfVector );
		float exponential = pow( base, 5.0 );

		float fresnel = exponential + F0 * ( 1.0 - exponential );
		*/

		/*
		// fresnel term from fresnel shader
		const float mFresnelBias = 0.08;
		const float mFresnelScale = 0.3;
		const float mFresnelPower = 5.0;

		float fresnel = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( -viewPosition ), normal ), mFresnelPower );
		*/

		float specularNormalization = ( shininess + 2.0 ) / 8.0;

		// 		dirSpecular += specular * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization * fresnel;

		vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( dirVector, dirHalfVector ), 0.0 ), 5.0 );
		dirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;


	}

#endif

#if MAX_HEMI_LIGHTS > 0

	vec3 hemiDiffuse = vec3( 0.0 );
	vec3 hemiSpecular = vec3( 0.0 );

	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );
		vec3 lVector = normalize( lDirection.xyz );

		// diffuse

		float dotProduct = dot( normal, lVector );
		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;

		vec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );

		hemiDiffuse += diffuse * hemiColor;

		// specular (sky light)

		vec3 hemiHalfVectorSky = normalize( lVector + viewPosition );
		float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;
		float hemiSpecularWeightSky = specularStrength * max( pow( max( hemiDotNormalHalfSky, 0.0 ), shininess ), 0.0 );

		// specular (ground light)

		vec3 lVectorGround = -lVector;

		vec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );
		float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;
		float hemiSpecularWeightGround = specularStrength * max( pow( max( hemiDotNormalHalfGround, 0.0 ), shininess ), 0.0 );

		float dotProductGround = dot( normal, lVectorGround );

		float specularNormalization = ( shininess + 2.0 ) / 8.0;

		vec3 schlickSky = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, hemiHalfVectorSky ), 0.0 ), 5.0 );
		vec3 schlickGround = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 0.0 ), 5.0 );
		hemiSpecular += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );

	}

#endif

vec3 totalDiffuse = vec3( 0.0 );
vec3 totalSpecular = vec3( 0.0 );

#if MAX_DIR_LIGHTS > 0

	totalDiffuse += dirDiffuse;
	totalSpecular += dirSpecular;

#endif

#if MAX_HEMI_LIGHTS > 0

	totalDiffuse += hemiDiffuse;
	totalSpecular += hemiSpecular;

#endif

#if MAX_POINT_LIGHTS > 0

	totalDiffuse += pointDiffuse;
	totalSpecular += pointSpecular;

#endif

#if MAX_SPOT_LIGHTS > 0

	totalDiffuse += spotDiffuse;
	totalSpecular += spotSpecular;

#endif

#ifdef METAL

	gl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient + totalSpecular );

#else

	gl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient ) + totalSpecular;

#endif
#ifdef USE_LIGHTMAP

	gl_FragColor = gl_FragColor * texture2D( lightMap, vUv2 );

#endif
#ifdef USE_COLOR

	gl_FragColor = gl_FragColor * vec4( vColor, 1.0 );

#endif
#ifdef USE_ENVMAP

	vec3 reflectVec;

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )

		vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );

		// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations
		// Transforming Normal Vectors with the Inverse Transformation

		vec3 worldNormal = normalize( vec3( vec4( normal, 0.0 ) * viewMatrix ) );

		if ( useRefract ) {

			reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );

		} else { 

			reflectVec = reflect( cameraToVertex, worldNormal );

		}

	#else

		reflectVec = vReflect;

	#endif

	#ifdef DOUBLE_SIDED

		float flipNormal = ( -1.0 + 2.0 * float( gl_FrontFacing ) );
		vec4 cubeColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );

	#else

		vec4 cubeColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );

	#endif

	#ifdef GAMMA_INPUT

		cubeColor.xyz *= cubeColor.xyz;

	#endif

	if ( combine == 1 ) {

		gl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularStrength * reflectivity );

	} else if ( combine == 2 ) {

		gl_FragColor.xyz += cubeColor.xyz * specularStrength * reflectivity;

	} else {

		gl_FragColor.xyz = mix( gl_FragColor.xyz, gl_FragColor.xyz * cubeColor.xyz, specularStrength * reflectivity );

	}

#endif
#ifdef USE_SHADOWMAP

	#ifdef SHADOWMAP_DEBUG

		vec3 frustumColors[3];
		frustumColors[0] = vec3( 1.0, 0.5, 0.0 );
		frustumColors[1] = vec3( 0.0, 1.0, 0.8 );
		frustumColors[2] = vec3( 0.0, 0.5, 1.0 );

	#endif

	#ifdef SHADOWMAP_CASCADE

		int inFrustumCount = 0;

	#endif

	float fDepth;
	vec3 shadowColor = vec3( 1.0 );

	for( int i = 0; i < MAX_SHADOWS; i ++ ) {

		vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;

				// if ( something && something ) breaks ATI OpenGL shader compiler
				// if ( all( something, something ) ) using this instead

		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
		bool inFrustum = all( inFrustumVec );

				// don't shadow pixels outside of light frustum
				// use just first frustum (for cascades)
				// don't shadow pixels behind far plane of light frustum

		#ifdef SHADOWMAP_CASCADE

			inFrustumCount += int( inFrustum );
			bvec3 frustumTestVec = bvec3( inFrustum, inFrustumCount == 1, shadowCoord.z <= 1.0 );

		#else

			bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );

		#endif

		bool frustumTest = all( frustumTestVec );

		if ( frustumTest ) {

			shadowCoord.z += shadowBias[ i ];

			#if defined( SHADOWMAP_TYPE_PCF )

						// Percentage-close filtering
						// (9 pixel kernel)
						// http://fabiensanglard.net/shadowmappingPCF/

				float shadow = 0.0;

		/*
						// nested loops breaks shader compiler / validator on some ATI cards when using OpenGL
						// must enroll loop manually

				for ( float y = -1.25; y <= 1.25; y += 1.25 )
					for ( float x = -1.25; x <= 1.25; x += 1.25 ) {

						vec4 rgbaDepth = texture2D( shadowMap[ i ], vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy );

								// doesn't seem to produce any noticeable visual difference compared to simple texture2D lookup
								//vec4 rgbaDepth = texture2DProj( shadowMap[ i ], vec4( vShadowCoord[ i ].w * ( vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy ), 0.05, vShadowCoord[ i ].w ) );

						float fDepth = unpackDepth( rgbaDepth );

						if ( fDepth < shadowCoord.z )
							shadow += 1.0;

				}

				shadow /= 9.0;

		*/

				const float shadowDelta = 1.0 / 9.0;

				float xPixelOffset = 1.0 / shadowMapSize[ i ].x;
				float yPixelOffset = 1.0 / shadowMapSize[ i ].y;

				float dx0 = -1.25 * xPixelOffset;
				float dy0 = -1.25 * yPixelOffset;
				float dx1 = 1.25 * xPixelOffset;
				float dy1 = 1.25 * yPixelOffset;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );

			#elif defined( SHADOWMAP_TYPE_PCF_SOFT )

						// Percentage-close filtering
						// (9 pixel kernel)
						// http://fabiensanglard.net/shadowmappingPCF/

				float shadow = 0.0;

				float xPixelOffset = 1.0 / shadowMapSize[ i ].x;
				float yPixelOffset = 1.0 / shadowMapSize[ i ].y;

				float dx0 = -1.0 * xPixelOffset;
				float dy0 = -1.0 * yPixelOffset;
				float dx1 = 1.0 * xPixelOffset;
				float dy1 = 1.0 * yPixelOffset;

				mat3 shadowKernel;
				mat3 depthKernel;

				depthKernel[0][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
				depthKernel[0][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
				depthKernel[0][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
				depthKernel[1][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
				depthKernel[1][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
				depthKernel[1][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
				depthKernel[2][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
				depthKernel[2][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
				depthKernel[2][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );

				vec3 shadowZ = vec3( shadowCoord.z );
				shadowKernel[0] = vec3(lessThan(depthKernel[0], shadowZ ));
				shadowKernel[0] *= vec3(0.25);

				shadowKernel[1] = vec3(lessThan(depthKernel[1], shadowZ ));
				shadowKernel[1] *= vec3(0.25);

				shadowKernel[2] = vec3(lessThan(depthKernel[2], shadowZ ));
				shadowKernel[2] *= vec3(0.25);

				vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[i].xy );

				shadowKernel[0] = mix( shadowKernel[1], shadowKernel[0], fractionalCoord.x );
				shadowKernel[1] = mix( shadowKernel[2], shadowKernel[1], fractionalCoord.x );

				vec4 shadowValues;
				shadowValues.x = mix( shadowKernel[0][1], shadowKernel[0][0], fractionalCoord.y );
				shadowValues.y = mix( shadowKernel[0][2], shadowKernel[0][1], fractionalCoord.y );
				shadowValues.z = mix( shadowKernel[1][1], shadowKernel[1][0], fractionalCoord.y );
				shadowValues.w = mix( shadowKernel[1][2], shadowKernel[1][1], fractionalCoord.y );

				shadow = dot( shadowValues, vec4( 1.0 ) );

				shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );

			#else

				vec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );
				float fDepth = unpackDepth( rgbaDepth );

				if ( fDepth < shadowCoord.z )

		// spot with multiple shadows is darker

					shadowColor = shadowColor * vec3( 1.0 - shadowDarkness[ i ] );

		// spot with multiple shadows has the same color as single shadow spot

		// 					shadowColor = min( shadowColor, vec3( shadowDarkness[ i ] ) );

			#endif

		}


		#ifdef SHADOWMAP_DEBUG

			#ifdef SHADOWMAP_CASCADE

				if ( inFrustum && inFrustumCount == 1 ) gl_FragColor.xyz *= frustumColors[ i ];

			#else

				if ( inFrustum ) gl_FragColor.xyz *= frustumColors[ i ];

			#endif

		#endif

	}

	#ifdef GAMMA_OUTPUT

		shadowColor *= shadowColor;

	#endif

	gl_FragColor.xyz = gl_FragColor.xyz * shadowColor;

#endif

#ifdef GAMMA_OUTPUT

	gl_FragColor.xyz = sqrt( gl_FragColor.xyz );

#endif
#ifdef USE_FOG

	#ifdef USE_LOGDEPTHBUF_EXT

		float depth = gl_FragDepthEXT / gl_FragCoord.w;

	#else

		float depth = gl_FragCoord.z / gl_FragCoord.w;

	#endif

	#ifdef FOG_EXP2

		const float LOG2 = 1.442695;
		float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
		fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );

	#else

		float fogFactor = smoothstep( fogNear, fogFar, depth );

	#endif
	
	gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

#endif
}
