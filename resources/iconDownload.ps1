# Simple script for downloading material design icons

$materialIconNames = @(
	"file_copy",
	"arrow_upward",
	"chevron_right",
	"clear",
	"copyright",
	"date_range",
	"arrow_drop_down",
	"filter",
	"info",
	"link",
	"edit",
	"navigate_next",
	"person",
	"navigate_before",
	"search",
	"share",
	"warning"
)

$materialUrlFormat = "https://material.io/tools/icons/static/icons/sharp-{0}-24px.svg"
$outfileFormat = "material-design-{0}.svg"
$requireFormat = "require('../../resources/{0}')"

$requires = ""

foreach($materialIconName in $materialIconNames){
	$normalizedMaterialIconName = $materialIconName.replace('_', '-')
	$outfile = $outfileFormat -f $normalizedMaterialIconName
	$url = $materialUrlFormat -f $materialIconName

	"Downloading: " + $materialIconName + " From: " + $url + " To: " + $outfile

	wget $url -outfile $outfile

	$requires = $requires + "`n" + ($requireFormat -f $outfile)
}

$requires

