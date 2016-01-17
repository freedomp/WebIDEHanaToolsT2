// init creatable objects in vbi context
/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
VBI.Tex = null; // texture object
VBI.Shader = null; // shader object
VBI.FB = null; // frame buffer object
VBI.Vals = null;
VBI.Ro = null; // render output

VBI.Hm = null; // heatmap object

// ...........................................................................//
// hook into webgl...........................................................//

VBI.Hook = (function() {
	"use strict";
	// override getExtension for different vendors............................//
	if (window.WebGLRenderingContext) {
		// hook get the rendercontect getExtension.............................//
		var getExtension = WebGLRenderingContext.prototype.getExtension;
		WebGLRenderingContext.prototype.getExtension = function(name) {
			var vendors = [
				'MS', 'WEBKIT', 'MOZ', 'O'
			];
			var oExt, vendor;
			if ((oExt = getExtension.call(this, name)) === null) {
				for (var nJ = 0, len = vendors.length; nJ < len; ++nJ) {
					vendor = vendors[nJ];
					if ((oExt = getExtension.call(this, vendor + '_' + name)) !== null) {
						return oExt;
					}
				}
				return null;
			} else {
				return oExt;
			}
		};

		
		// add helper function.................................................//
		WebGLRenderingContext.prototype.getExtensions = function(spec) {
			// try to get all extensions
			this.getExtension('OES_texture_float');
			this.getExtension('OES_texture_half_float');
			this.getExtension('OES_texture_half_floatnLLinear');
			this.getExtension('WEBGL_color_buffer_float');
			return;
		};
	}
})();

VBI.Shader = (function() {
	"use strict";
	function Shader(gl, vs, fs) {
		this.m_GL = gl; // store gl object
		this.m_UL = {}; // variable locations in program

		// compile and link the provided coding
		this.m_Prog = this.m_GL.createProgram();
		this.m_VS = this.m_GL.createShader(this.m_GL.VERTEX_SHADER);
		this.m_FS = this.m_GL.createShader(this.m_GL.FRAGMENT_SHADER);
		this.m_GL.attachShader(this.m_Prog, this.m_VS);
		this.Compile(this.m_VS, vs);
		this.m_GL.attachShader(this.m_Prog, this.m_FS);
		this.Compile(this.m_FS, fs);

		this.Link();
	}

	Shader.prototype.getShaderVar = function(name) {
		return this.m_GL.getAttribLocation(this.m_Prog, name);
	};

	Shader.prototype.Compile = function(shader, source) {
		this.m_GL.shaderSource(shader, source);
		this.m_GL.compileShader(shader);
		if (!this.m_GL.getShaderParameter(shader, this.m_GL.COMPILE_STATUS)) {
			jQuery.sap.log.error("Shader Compilation Error");
		}
	};

	Shader.prototype.Link = function() {
		this.m_GL.linkProgram(this.m_Prog);
		if (!this.m_GL.getProgramParameter(this.m_Prog, this.m_GL.LINK_STATUS)) {
			jQuery.sap.log.error("Shader Link Error");
		}

	};

	Shader.prototype.Apply = function() {
		this.m_GL.useProgram(this.m_Prog);
		return this;
	};

	Shader.prototype.getLoc = function(name) {
		var loc = this.m_UL[name];
		if (typeof (loc) === "undefined") {
			loc = this.m_UL[name] = this.m_GL.getUniformLocation(this.m_Prog, name);
		}
		return loc;
	};

	Shader.prototype.SetInt = function(name, val) {
		this.m_GL.uniform1i(this.getLoc(name), val);
		return this;
	};

	Shader.prototype.SetV2 = function(name, val) {
		this.m_GL.uniform2f(this.getLoc(name), val[0], val[1]);
	};

	return Shader;
})();

VBI.FB = (function() {
	"use strict";
	function FB(gl) {
		this.m_GL = gl;
		this.m_FB = this.m_GL.createFramebuffer();
	}

	FB.prototype.destroy = function() {
		return this.m_GL.deleteFramebuffer(this.m_FB);
	};

	FB.prototype.BindFB = function() {
		this.m_GL.bindFramebuffer(this.m_GL.FRAMEBUFFER, this.m_FB);
		return this;
	};

	FB.prototype.UnBindFB = function() {
		this.m_GL.bindFramebuffer(this.m_GL.FRAMEBUFFER, null);
		return this;
	};

	FB.prototype.SetTex = function(tex) {
		this.m_GL.framebufferTexture2D(this.m_GL.FRAMEBUFFER, this.m_GL.COLOR_ATTACHMENT0, this.m_GL.TEXTURE_2D, tex.m_Tex, 0);
		return this;
	};

	return FB;
})();

VBI.Tex = (function() {
	"use strict";
	function Tex(gl, params) {
		var tmp;
		this.m_GL = gl;

		params = params ? params : {};

		this.m_colFmt = this.m_GL[((tmp = params.colfmt) != null ? tmp : 'rgba').toUpperCase()];
		if (typeof params.type === 'number') {
			this.type = params.type;
		} else {
			this.type = this.m_GL[((tmp = params.type) != null ? tmp : 'unsigned_byte').toUpperCase()];
		}

		this.m_Tex = this.m_GL.createTexture();
	}

	Tex.prototype.destroy = function() {
		return this.m_GL.deleteTexture(this.m_Tex);
	};

	Tex.prototype.BindTex = function(slot) {
		if (slot == null) {
			slot = 0;
		}
		this.m_GL.activeTexture(this.m_GL.TEXTURE0 + slot);
		this.m_GL.bindTexture(this.m_GL.TEXTURE_2D, this.m_Tex);
		return this;
	};

	Tex.prototype.AdjustSize = function(w, h) {
		this.m_W = w;
		this.m_H = h;
		this.m_GL.texImage2D(this.m_GL.TEXTURE_2D, 0, this.m_colFmt, w, h, 0, this.m_colFmt, this.type, null);
		return this;
	};

	Tex.prototype.SetImage = function(data) {
		this.m_W = data.width;
		this.m_H = data.height;
		this.m_GL.texImage2D(this.m_GL.TEXTURE_2D, 0, this.m_colFmt, this.m_colFmt, this.type, data);
		return this;
	};

	Tex.prototype.SetFilterNearest = function() {
		this.m_GL.texParameteri(this.m_GL.TEXTURE_2D, this.m_GL.TEXTURE_MAG_FILTER, this.m_GL.NEAREST);
		this.m_GL.texParameteri(this.m_GL.TEXTURE_2D, this.m_GL.TEXTURE_MIN_FILTER, this.m_GL.NEAREST);
		return this;
	};

	Tex.prototype.SetWrapEdge = function() {
		this.m_GL.texParameteri(this.m_GL.TEXTURE_2D, this.m_GL.TEXTURE_WRAP_S, this.m_GL.CLAMP_TO_EDGE);
		this.m_GL.texParameteri(this.m_GL.TEXTURE_2D, this.m_GL.TEXTURE_WRAP_T, this.m_GL.CLAMP_TO_EDGE);
		return this;
	};

	return Tex;
})();

VBI.Ro = (function() {
	"use strict";
	function Ro(gl, width, height) {
		this.m_GL = gl;
		this.m_W = width;
		this.m_H = height;

		this.m_GL.getExtensions(); // require some extensions

		// create a float texture
		this.m_Tex = new VBI.Tex(this.m_GL, {
			type: 36193
		});
		this.m_Tex.BindTex(0);
		this.m_Tex.AdjustSize(width, height);
		this.m_Tex.SetFilterNearest();
		this.m_Tex.SetWrapEdge();

		// create the frame buffer based on texture
		this.m_FB = new VBI.FB(this.m_GL);
		this.m_FB.BindFB();
		this.m_FB.SetTex(this.m_Tex);
		this.m_FB.UnBindFB();
	}

	Ro.prototype.Apply = function() {
		return this.m_FB.BindFB();
	};

	Ro.prototype.BindRo = function(slot) {
		return this.m_Tex.BindTex(slot);
	};

	Ro.prototype.UnBindRo = function() {
		this.m_FB.UnBindFB();
	};

	Ro.prototype.AdjustSize = function(width, height) {
		this.m_W = width;
		this.m_H = height;

		// set the new size of the texture
		return this.m_Tex.BindTex(0).AdjustSize(width, height);
	};

	return Ro;
})();

// values for heatmap
VBI.Vals = (function() {
	"use strict";
	function Vals(gl, width, height) {
		this.m_GL = gl;

		// constants
		this.m_nPointChunk = 10240; // chunksize
		this.m_vBufs = []; // vertex buffers of chunksize
		this.m_nVertexSize = 8;

		this.m_W = width;
		this.m_H = height;

		this.m_Shader = new VBI.Shader(this.m_GL, "attribute vec4 pos, value;\nvarying vec2 off, dim;\nuniform vec2 size;\nvarying float val;\n void main(){ off = pos.zw; dim = abs(pos.zw); vec2 pos = pos.xy + pos.zw; val=value.x; gl_Position=vec4((pos/size)*2.0-1.0, 0.0, 1.0);}\n", "#ifdef GL_FRAGMENT_PRECISION_HIGH\n precision highp int;\n precision highp float;\n#else\n precision mediump int;\n precision mediump float;\n#endif\nvarying vec2 off, dim;\nvarying float val;\nvoid main(){ float f = (1.0-smoothstep(0.0,1.0,length(off/dim))); float tmp = f*val; gl_FragColor=vec4(tmp);}\n");
		// "#ifdef GL_FRAGMENT_PRECISION_HIGH\n precision highp int;\n precision highp float;\n#else\n precision mediump int;\n precision mediump
		// float;\n#endif\nvarying vec2 off, dim;\nvarying float val;\nvoid main(){ float d = length(off/dim); float f = exp( -1.0/(d*d) ); float tmp
		// = f*val; gl_FragColor=vec4(tmp);}\n");

		// create a render output buffer
		this.m_Ro = new VBI.Ro(this.m_GL, this.m_W, this.m_H);

		this.m_VB = this.m_GL.createBuffer();
		this.m_vBuf = new Float32Array(this.m_nPointChunk * this.m_nVertexSize * 6);

		for (var nJ = 0, nK = 0, tmp = this.m_nPointChunk; tmp >= 0 ? nK < tmp : nK > tmp; nJ = (tmp >= 0) ? ++nK : --nK) {
			this.m_vBufs.push(new Float32Array(this.m_vBuf.buffer, 0, nJ * this.m_nVertexSize * 6));
		}

		this.m_nIdx = 0;
		this.m_nPoints = 0;
	}

	Vals.prototype.AdjustSize = function(w, h) {
		this.m_W = w;
		this.m_H = h;
		this.m_Ro.AdjustSize(this.m_W, this.m_H);
		return;
	};

	Vals.prototype.Render = function() {
		if (this.m_nPoints > 0) {
			this.m_GL.enable(this.m_GL.BLEND);
			this.m_Ro.Apply();
			this.m_GL.bindBuffer(this.m_GL.ARRAY_BUFFER, this.m_VB);
			this.m_GL.bufferData(this.m_GL.ARRAY_BUFFER, this.m_vBufs[this.m_nPoints], this.m_GL.STREAM_DRAW);

			// get shader variables
			var svPos = this.m_Shader.getShaderVar('pos');
			var svValue = this.m_Shader.getShaderVar('value');

			this.m_GL.enableVertexAttribArray(1);
			this.m_GL.vertexAttribPointer(svPos, 4, this.m_GL.FLOAT, false, 32, 0);
			this.m_GL.vertexAttribPointer(svValue, 4, this.m_GL.FLOAT, false, 32, 16);
			this.m_Shader.Apply();
			this.m_Shader.SetV2('size', [
				this.m_W, this.m_H
			]);

			// draw squares
			this.m_GL.drawArrays(this.m_GL.TRIANGLES, 0, this.m_nPoints * 6);
			this.m_GL.disableVertexAttribArray(1);

			// cleanup
			this.m_Ro.UnBindRo();
			this.m_GL.disable(this.m_GL.BLEND);
			this.m_nPoints = 0;
			this.m_nIdx = 0;
		}
	};

	Vals.prototype.Clear = function() {
		this.m_Ro.Apply();
		this.m_GL.clearColor(0.0, 0.0, 0.0, 0.0);
		this.m_GL.clear(this.m_GL.COLOR_BUFFER_BIT);
		return this.m_Ro.UnBindRo();
	};

	Vals.prototype.AddPoint = function(x, y, val, sz) {
		// when more points than chunksize render multiple times the gray image..//
		if ((this.m_nPoints + 1) >= this.m_nPointChunk) {
			this.Render();
		}

		y = this.m_H - y; // flip y coordinate
		var s = sz / 2;

		// the flat rectangle to draw to.........................................//
		var av = this.PushVertex.bind(this);
		av(x, y, -s, -s, val);
		av(x, y, +s, -s, val);
		av(x, y, -s, +s, val);
		av(x, y, -s, +s, val);
		av(x, y, +s, -s, val);
		av(x, y, +s, +s, val);
		this.m_nPoints += 1;
		return this.m_nPoints;
	};

	Vals.prototype.PushVertex = function(x, y, xs, ys, val) {
		var a = this.m_vBuf;
		a[this.m_nIdx++] = x;
		a[this.m_nIdx++] = y;
		a[this.m_nIdx++] = xs;
		a[this.m_nIdx++] = ys;
		a[this.m_nIdx++] = a[this.m_nIdx++] = a[this.m_nIdx++] = a[this.m_nIdx++] = val;
	};

	return Vals;
})();

VBI.Hm = (function() {
	"use strict";
	function Hm(oArgs) {
		var calcAlpha; // shader fragment to calculate an alpha
		var calcCol; // shader fragment to calculate the color

		var image;

		// adjust arguments
		if (typeof (oArgs.alphaBounds == 'undefined')) {
			oArgs.alphaBounds = [
				0.0, 1.0
			];
		}
		if (typeof (oArgs.alpha == 'undefined')) {
			oArgs.alpha = true;
		}

		this.m_Canv = oArgs.canvas; // store the canvas
		this.m_W = oArgs.width; // store width
		this.m_H = oArgs.height; // store height

		if (!this.m_Canv) {
			this.m_Canv = document.createElement("canvas");
		}

		var oAttibutes = {
			depth: false,
			antialias: false,
			alpha: true
		}; // webgl attributes

		// get the webgl context...............................................//
		if (!this.m_GL) {
			this.m_GL = this.m_Canv.getContext("experimental-webgl", oAttibutes);
		}
		if (!this.m_GL) {
			this.m_GL = this.m_Canv.getContext("webgl", oAttibutes);
		}
		if (!this.m_GL) {
			jQuery.sap.log.error("WebGL not supported");
			return;
		}

		this.m_GL.blendFunc(this.m_GL.ONE, this.m_GL.ONE); // no blend, just copy to colors to output
		this.m_GL.enableVertexAttribArray(0);

		// check if a gradient texture is specified
		if (oArgs.colorTexture) {
			this.m_ColorTexture = new VBI.Tex(this.m_GL, {
				colfmt: "rgba"
			});
			this.m_ColorTexture.BindTex(0);
			this.m_ColorTexture.SetFilterNearest();
			this.m_ColorTexture.SetWrapEdge();
			this.m_ColorTexture.AdjustSize(2, 2);

			if (typeof (oArgs.colorTexture) === "string") {
				image = new Image();
				image.onload = function() {
					this.m_ColorTexture.BindTex(0);
					this.m_ColorTexture.SetImage(image);
				}.bind(this);
				image.src = oArgs.colorTexture;
			}
			calcCol = "uniform sampler2D colTex; vec3 calcCol( float g ){ return texture2D( colTex, vec2( g, 0.5 )).rgb; }\n";
		} else {
			calcCol = "vec3 calcCol( float g ){ return smoothstep( vec3( 0.0, 0.0, 1.0 ), vec3( 1.0, 1.0, 0.0 ), vec3( g ) ); }";
		}

		// assemble alpha usage shader code
		if (oArgs.alpha) {
			calcAlpha = " vec4 calcAlpha(vec3 c,float i){ float a = smoothstep(" + (oArgs.alphaBounds[0].toFixed(8)) + "," + (oArgs.alphaBounds[1].toFixed(8)) + ",i); return vec4( c*a, a); }\n";
		} else {
			calcAlpha = " vec4 calcAlpha(vec3 c, float i){ return vec4(c,1.0);}\n";
		}

		var fsVars = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n precision highp int;\n precision highp float;\n#else\n precision mediump int;\n precision mediump float;\n#endif\nuniform sampler2D src;\nvarying vec2 txy;\n";
		var fsMain = "\nvoid main(){ float f = smoothstep( 0.0, 1.0, texture2D(src, txy).b ); vec3 color = calcCol(f); gl_FragColor = calcAlpha( color, f ); }\n";

		// create the shader that does the output to the canvas, it uses the blue channel for color mapping
		this.m_Shader = new VBI.Shader(this.m_GL, "attribute vec4 pos; varying vec2 txy; void main(){ txy = pos.xy*0.5+0.5; gl_Position = pos; }", fsVars + calcCol + "\n" + calcAlpha + fsMain);

		if (this.m_W == null) {
			this.m_W = this.m_Canv.offsetWidth || 2;
		}

		if (this.m_H == null) {
			this.m_H = this.m_Canv.offsetHeight || 2;
		}

		this.m_Canv.width = this.m_W;
		this.m_Canv.height = this.m_H;

		// square geometry with uv coordinates
		var geo = new Float32Array([
			-1, -1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 0, 1, 1, 1, 0, 1
		]);
		this.m_Geo = this.m_GL.createBuffer();

		this.m_GL.viewport(0, 0, this.m_W, this.m_H);
		this.m_GL.bindBuffer(this.m_GL.ARRAY_BUFFER, this.m_Geo);

		this.m_GL.bufferData(this.m_GL.ARRAY_BUFFER, geo, this.m_GL.STATIC_DRAW);
		this.m_GL.bindBuffer(this.m_GL.ARRAY_BUFFER, null);

		// values
		this.m_V = new VBI.Vals(this.m_GL, this.m_W, this.m_H);
	}

	Hm.prototype.AdjustSize = function() {
		if (!this.m_GL) {
			return; // do nothing
		}

		var cH = this.m_Canv.offsetHeight || 2;
		var cW = this.m_Canv.offsetWidth || 2;
		if (this.m_W !== cW || this.m_H !== cH) {
			this.m_GL.viewport(0, 0, cW, cH);
			this.m_Canv.width = cW;
			this.m_Canv.height = cH;
			this.m_W = cW;
			this.m_H = cH;
			this.m_V.AdjustSize(this.m_W, this.m_H);
		}
	};

	Hm.prototype.RenderColors = function() {
		// important, the values have to be rendered already in the output buffer
		if (!this.m_GL) {
			return; // do nothing
		}

		// set simple full canvas geometry
		this.m_GL.bindBuffer(this.m_GL.ARRAY_BUFFER, this.m_Geo);
		this.m_GL.vertexAttribPointer(0, 4, this.m_GL.FLOAT, false, 0, 0);

		// set the render output and the color mapping texture
		this.m_V.m_Ro.BindRo(0);
		if (this.m_ColorTexture) {
			this.m_ColorTexture.BindTex(1);
		}

		// bind the final canvas shader
		this.m_Shader.Apply();
		this.m_Shader.SetInt("src", 0);
		this.m_Shader.SetInt("colTex", 1);
		this.m_GL.drawArrays(this.m_GL.TRIANGLES, 0, 6);
		return;
	};

	Hm.prototype.RenderValues = function() {
		if (!this.m_GL) {
			return; // do nothing
		}
		if (this.m_V) {
			this.m_V.Render();
		}
	};

	Hm.prototype.Render = function() {
		this.RenderValues(); // render values in gray texture
		this.RenderColors(); // apply colors to gray texture and rener to canvas
	};

	Hm.prototype.Clear = function() {
		return this.m_V ? this.m_V.Clear() : null;
	};

	Hm.prototype.AddPoint = function(x, y, val, sz) {
		return this.m_V ? this.m_V.AddPoint(x, y, val, sz) : null;
	};

	// return the heatmap object..............................................//
	return Hm;
})();

VBI.CreateHM = function(params) {
	"use strict";
	return new VBI.Hm(params);
};
