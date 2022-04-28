import fsExtra from "fs-extra";
import path from "path";
import execa from "execa";
import { generationOptions } from "./generation-options";

// This is where the code generation logic lives. In high-level, based on the provided option, it creates
// a folder, decides which code to generate, run the code through a templating engine and emit it to the target folder
export const generateApp = async (options: generationOptions) => {
  const targetDirectory = path.join(options.targetDirectory, options.appName);
  const sourceDirectory = path.join(__dirname, "../../code-templates");
  if (await fsExtra.pathExists(targetDirectory)) {
    await fsExtra.rm(targetDirectory, { recursive: true }); //TODO: Revisit this default and consider
  }
  await fsExtra.mkdir(targetDirectory, {});
  await fsExtra.copy(sourceDirectory, targetDirectory, {
    // We don't want to copy the node_modules folder since it's slow and error-prone
    filter: (copyFromPath, copyToPath) => {
      if (path.basename(copyFromPath) === "node_modules") {
        return false;
      } else {
        return true;
      }
    },
    overwrite: true,
  });

  if (options.installDependencies) {
    await execa("npm", ["install"], {
      cwd: targetDirectory,
    });

    await execa("npm", ["run", "lerna", "--", "bootstrap"], {
      cwd: targetDirectory,
    });
  }

  console.log(`App was generated successfully`);
  return;
};