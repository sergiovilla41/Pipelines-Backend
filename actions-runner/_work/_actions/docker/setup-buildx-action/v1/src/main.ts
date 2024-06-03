import * as os from 'os';
import * as path from 'path';
import * as uuid from 'uuid';
import * as buildx from './buildx';
import * as context from './context';
import * as docker from './docker';
import * as stateHelper from './state-helper';
import * as util from './util';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run(): Promise<void> {
  try {
    const inputs: context.Inputs = await context.getInputs();
    const dockerConfigHome: string = process.env.DOCKER_CONFIG || path.join(os.homedir(), '.docker');

    // standalone if docker cli not available
    const standalone = !(await docker.isAvailable());
    stateHelper.setStandalone(standalone);

    core.startGroup(`Docker info`);
    if (standalone) {
      core.info(`Docker info skipped in standalone mode`);
    } else {
      await exec.exec('docker', ['version'], {
        failOnStdErr: false
      });
      await exec.exec('docker', ['info'], {
        failOnStdErr: false
      });
    }
    core.endGroup();

    if (util.isValidUrl(inputs.version)) {
      if (standalone) {
        throw new Error(`Cannot build from source without the Docker CLI`);
      }
      core.startGroup(`Build and install buildx`);
      await buildx.build(inputs.version, dockerConfigHome, standalone);
      core.endGroup();
    } else if (!(await buildx.isAvailable(standalone)) || inputs.version) {
      core.startGroup(`Download and install buildx`);
      await buildx.install(inputs.version || 'latest', standalone ? context.tmpDir() : dockerConfigHome, standalone);
      core.endGroup();
    }

    const buildxVersion = await buildx.getVersion(standalone);
    await core.group(`Buildx version`, async () => {
      const versionCmd = buildx.getCommand(['version'], standalone);
      await exec.exec(versionCmd.commandLine, versionCmd.args, {
        failOnStdErr: false
      });
    });

    const builderName: string = inputs.driver == 'docker' ? 'default' : `builder-${uuid.v4()}`;
    context.setOutput('name', builderName);
    stateHelper.setBuilderName(builderName);

    if (inputs.driver !== 'docker') {
      core.startGroup(`Creating a new builder instance`);
      const createArgs: Array<string> = ['create', '--name', builderName, '--driver', inputs.driver];
      if (buildx.satisfies(buildxVersion, '>=0.3.0')) {
        await context.asyncForEach(inputs.driverOpts, async driverOpt => {
          createArgs.push('--driver-opt', driverOpt);
        });
        if (inputs.buildkitdFlags) {
          createArgs.push('--buildkitd-flags', inputs.buildkitdFlags);
        }
      }
      if (inputs.use) {
        createArgs.push('--use');
      }
      if (inputs.endpoint) {
        createArgs.push(inputs.endpoint);
      }
      if (inputs.config) {
        createArgs.push('--config', await buildx.getConfigFile(inputs.config));
      } else if (inputs.configInline) {
        createArgs.push('--config', await buildx.getConfigInline(inputs.configInline));
      }
      const createCmd = buildx.getCommand(createArgs, standalone);
      await exec.exec(createCmd.commandLine, createCmd.args);
      core.endGroup();

      core.startGroup(`Booting builder`);
      const bootstrapArgs: Array<string> = ['inspect', '--bootstrap'];
      if (buildx.satisfies(buildxVersion, '>=0.4.0')) {
        bootstrapArgs.push('--builder', builderName);
      }
      const bootstrapCmd = buildx.getCommand(bootstrapArgs, standalone);
      await exec.exec(bootstrapCmd.commandLine, bootstrapCmd.args);
      core.endGroup();
    }

    if (inputs.install) {
      if (standalone) {
        throw new Error(`Cannot set buildx as default builder without the Docker CLI`);
      }
      core.startGroup(`Setting buildx as default builder`);
      await exec.exec('docker', ['buildx', 'install']);
      core.endGroup();
    }

    core.startGroup(`Inspect builder`);
    const builder = await buildx.inspect(builderName, standalone);
    core.info(JSON.stringify(builder, undefined, 2));
    context.setOutput('driver', builder.driver);
    context.setOutput('endpoint', builder.node_endpoint);
    context.setOutput('status', builder.node_status);
    context.setOutput('flags', builder.node_flags);
    context.setOutput('platforms', builder.node_platforms);
    core.endGroup();

    if (!standalone && inputs.driver == 'docker-container') {
      stateHelper.setContainerName(`buildx_buildkit_${builder.node_name}`);
      core.startGroup(`BuildKit version`);
      core.info(await buildx.getBuildKitVersion(`buildx_buildkit_${builder.node_name}`));
      core.endGroup();
    }
    if (core.isDebug() || builder.node_flags?.includes('--debug')) {
      stateHelper.setDebug('true');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function cleanup(): Promise<void> {
  if (stateHelper.IsDebug && stateHelper.containerName.length > 0) {
    core.startGroup(`BuildKit container logs`);
    await exec
      .getExecOutput('docker', ['logs', `${stateHelper.containerName}`], {
        ignoreReturnCode: true
      })
      .then(res => {
        if (res.stderr.length > 0 && res.exitCode != 0) {
          core.warning(res.stderr.trim());
        }
      });
    core.endGroup();
  }

  if (stateHelper.builderName.length > 0) {
    core.startGroup(`Removing builder`);
    const rmCmd = buildx.getCommand(['rm', stateHelper.builderName], /true/i.test(stateHelper.standalone));
    await exec
      .getExecOutput(rmCmd.commandLine, rmCmd.args, {
        ignoreReturnCode: true
      })
      .then(res => {
        if (res.stderr.length > 0 && res.exitCode != 0) {
          core.warning(res.stderr.trim());
        }
      });
    core.endGroup();
  }
}

if (!stateHelper.IsPost) {
  run();
} else {
  cleanup();
}
