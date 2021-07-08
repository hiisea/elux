/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

"use strict";
//todo
const path = require("path");
const webpackDir = path.dirname(require.resolve('webpack'));
const containerDir = path.join(webpackDir,'./container');
let ModuleMap = {};


const ExternalsPlugin = require(path.join(containerDir, "../ExternalsPlugin"));
const RuntimeGlobals = require(path.join(containerDir, "../RuntimeGlobals"));
const createSchemaValidation = require(path.join(containerDir, "../util/create-schema-validation"));
const FallbackDependency = require(path.join(containerDir, "./FallbackDependency"));
const FallbackItemDependency = require(path.join(containerDir, "./FallbackItemDependency"));
const FallbackModuleFactory = require(path.join(containerDir, "./FallbackModuleFactory"));
const RemoteModule = require(path.join(containerDir, "./RemoteModule"));
const RemoteRuntimeModule = require(path.join(containerDir, "./RemoteRuntimeModule"));
const RemoteToExternalDependency = require(path.join(containerDir, "./RemoteToExternalDependency"));
const { parseOptions } = require(path.join(containerDir, "./options"));

/** @typedef {import("../../declarations/plugins/container/ContainerReferencePlugin").ContainerReferencePluginOptions} ContainerReferencePluginOptions */
/** @typedef {import("../../declarations/plugins/container/ContainerReferencePlugin").RemotesConfig} RemotesConfig */
/** @typedef {import("../Compiler")} Compiler */

const validate = createSchemaValidation(
	require(path.join(containerDir, "../../schemas/plugins/container/ContainerReferencePlugin.check.js")),
	() =>
		require(path.join(containerDir, "../../schemas/plugins/container/ContainerReferencePlugin.json")),
	{
		name: "Container Reference Plugin",
		baseDataPath: "options"
	}
);

const slashCode = "/".charCodeAt(0);

class ContainerReferencePlugin {
	/**
	 * @param {ContainerReferencePluginOptions} options options
	 */
	constructor(options) {
		validate(options);

		this._remoteType = options.remoteType;
		this._remotes = parseOptions(
			options.remotes,
			item => ({
				external: Array.isArray(item) ? item : [item],
				shareScope: options.shareScope || "default"
			}),
			item => ({
				external: Array.isArray(item.external)
					? item.external
					: [item.external],
				shareScope: item.shareScope || options.shareScope || "default"
			})
		);
	}

	/**
	 * Apply the plugin
	 * @param {Compiler} compiler the compiler instance
	 * @returns {void}
	 */
	apply(compiler) {
		const { _remotes: remotes, _remoteType: remoteType } = this;

		/** @type {Record<string, string>} */
		const remoteExternals = {};
		for (const [key, config] of remotes) {
			let i = 0;
			for (const external of config.external) {
				if (external.startsWith("internal ")) continue;
				remoteExternals[
					`webpack/container/reference/${key}${i ? `/fallback-${i}` : ""}`
				] = external;
				i++;
			}
		}

		new ExternalsPlugin(remoteType, remoteExternals).apply(compiler);

		compiler.hooks.compilation.tap(
			"ContainerReferencePlugin",
			(compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(
					RemoteToExternalDependency,
					normalModuleFactory
				);

				compilation.dependencyFactories.set(
					FallbackItemDependency,
					normalModuleFactory
				);

				compilation.dependencyFactories.set(
					FallbackDependency,
					new FallbackModuleFactory()
				);
				normalModuleFactory.hooks.factorize.tap(
					"ContainerReferencePlugin",
					data => {
						if (!data.request.includes("!")) {
							for (const [key, config] of remotes) {
                const alias = data.request.split('/',3).join('/'); //todo
                const request = ModuleMap[alias] ? data.request.replace(alias, ModuleMap[alias]) : data.request;
                if (
									request.startsWith(`${key}`) &&
									(request.length === key.length ||
										request.charCodeAt(key.length) === slashCode)
								) {
									return new RemoteModule(
										request,
										config.external.map((external, i) =>
											external.startsWith("internal ")
												? external.slice(9)
												: `webpack/container/reference/${key}${
														i ? `/fallback-${i}` : ""
												  }`
										),
										`.${request.slice(key.length)}`,
										config.shareScope
									);
								}
							}
						}
					}
				);

				compilation.hooks.runtimeRequirementInTree
					.for(RuntimeGlobals.ensureChunkHandlers)
					.tap("ContainerReferencePlugin", (chunk, set) => {
						set.add(RuntimeGlobals.module);
						set.add(RuntimeGlobals.moduleFactoriesAddOnly);
						set.add(RuntimeGlobals.hasOwnProperty);
						set.add(RuntimeGlobals.initializeSharing);
						set.add(RuntimeGlobals.shareScopeMap);
						compilation.addRuntimeModule(chunk, new RemoteRuntimeModule());
					});
			}
		);
	}
}

ContainerReferencePlugin.__setModuleMap__ = function(data){
  ModuleMap = data;
}
module.exports = ContainerReferencePlugin;
