const data = document.getElementById("data");
const table = document.getElementById("table");

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = ".json";
fileInput.className = "gridjs-input";

data.insertBefore(fileInput, table);

const Grid = gridjs.Grid;

const grid = new Grid({
    columns: ["Target", "Library/Package", "Vulnerability", "Severity", "Installed Version", "Fixed Version", "Title"],
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
    if (!resources || resources.length == 0) return console.warn("Empty resources.");

    resources.forEach((resource) => {
        const results = resource.Results;
        if (!results) return console.warn("Empty results.");

        const vulnerabilities = results.Vulnerabilities;
        if (!vulnerabilities || vulnerabilities.length == 0) return console.warn("Empty vulnerabilities.");

        vulnerabilities.forEach((vulnerability) => {
            const { Target } = results;
            const { Library, VulnerabilityID, Severity, InstalledVersion, FixedVersion, Title } = vulnerability;

            for (let i = 0; i < 8000; i++) {
                data.push([
                    Target || "",
                    Library || "",
                    VulnerabilityID || "",
                    Severity || "",
                    InstalledVersion || "",
                    FixedVersion || "",
                    Title || ""
                ]);
            };
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