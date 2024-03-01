const data = document.getElementById("data");
const table = document.getElementById("table");

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = ".json";
fileInput.className = "gridjs-input";

data.insertBefore(fileInput, table);

const Grid = gridjs.Grid;

const grid = new Grid({
    columns: ["Namespace", "Target", "Package", "Installed Version", "Fixed Version", "Vulnerability", "Severity", "CVSS Score", "Title"],
    fixedHeader: true,
    height: "calc(100vh - 180px)",
    search: true,
    sort: true,
    resizable: true,
    pagination: {
        limit: 100,
        summary: true
    },
    data: []
});

grid.render(table);

function fileLoad(event) {
    let json;
    try {
        json = JSON.parse(event.target.result);
    } catch(err) {
        console.log(err);
    }
    if (!json) return;

    let data = [];

    const resources = json.Resources
    if (!resources || resources.length == 0) return;

    resources.forEach((resource) => {
        const results = resource.Results;
        if (!results || results.length == 0) return;

        const { Namespace } = resource;

        results.forEach((result) => {
            const vulnerabilities = result.Vulnerabilities;
            if (!vulnerabilities || vulnerabilities.length == 0) return;

            const { Target } = result;

            vulnerabilities.forEach((vulnerability) => {
                const {
                    PkgName,
                    InstalledVersion,
                    FixedVersion,
                    VulnerabilityID,
                    Severity,
                    CVSS,
                    Title
                } = vulnerability;

                const score = CVSS?.nvd?.V3Score;

                data.push([
                    Namespace,
                    Target,
                    PkgName,
                    InstalledVersion,
                    FixedVersion || "",
                    VulnerabilityID,
                    Severity,
                    score || "",
                    Title || ""
                ]);
            });
        });
    });

    // Prevent duplicate plugin id error.
    grid.config.plugin.remove("search");
    grid.config.plugin.remove("pagination");

    grid.updateConfig({
        search: true,
        pagination: {
            limit: 100,
            summary: true
        },
        data: data
    }).forceRender();
}

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = fileLoad;

    reader.readAsText(file);
});